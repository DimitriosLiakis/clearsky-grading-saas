package handler

import (
	"log"
	"net/http"

	"user_management_service/internal/model"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UpsertRequest struct {
	Username    string  `json:"username" binding:"required"`
	Role        string  `json:"role" binding:"required,oneof=student instructor institution_representative"`
	StudentID   string  `json:"student_id,omitempty"`
	Institution *string `json:"institution,omitempty"`
}

func UpsertUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req UpsertRequest
		log.Printf("UpsertUser called: %+v", req)
		if err := c.ShouldBindJSON(&req); err != nil {
			log.Printf("UpsertUser: invalid request body: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		log.Printf("UpsertUser: bound request: username=%s, role=%s, student_id=%s, institution=%v",
			req.Username, req.Role, req.StudentID, req.Institution)

		// Require institution when role == institution_representative
		if req.Role == "institution_representative" && (req.Institution == nil || *req.Institution == "") {
			log.Printf("UpsertUser: missing institution for role institution_representative")
			c.JSON(http.StatusBadRequest, gin.H{"error": "institution is required for institution_representative"})
			return
		}

		if req.Role == "instructor" && (req.Institution == nil || *req.Institution == "") {
			log.Printf("UpsertUser: missing institution for role instructor")
			c.JSON(http.StatusBadRequest, gin.H{"error": "institution is required for instructor"})
			return
		}

		var u model.User
		err := db.Where("username = ?", req.Username).First(&u).Error
		if err != nil {
			// CREATE new
			instVal := "" // default empty
			if req.Institution != nil {
				instVal = *req.Institution
			}
			u = model.User{
				ID:          uuid.NewString(),
				Username:    req.Username,
				Role:        req.Role,
				StudentID:   req.StudentID,
				Institution: instVal,
			}
			if err := db.Create(&u).Error; err != nil {
				log.Printf("UpsertUser: failed to create user %s: %v", req.Username, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
				return
			}
			log.Printf("UpsertUser: created new user ID=%s", u.ID)
		} else {
			// UPDATE existing
			log.Printf("UpsertUser: found existing user ID=%s", u.ID)
			if u.Role != req.Role {
				log.Printf("UpsertUser: updating role from %s to %s", u.Role, req.Role)
				u.Role = req.Role
			}
			if req.StudentID != "" && u.StudentID != req.StudentID {
				log.Printf("UpsertUser: updating student_id from %s to %s", u.StudentID, req.StudentID)
				u.StudentID = req.StudentID
			}
			// Only overwrite institution if client provided it
			if req.Institution != nil {
				log.Printf("UpsertUser: updating institution from %s to %s", u.Institution, *req.Institution)
				u.Institution = *req.Institution
			}
			if err := db.Save(&u).Error; err != nil {
				log.Printf("UpsertUser: failed to update user ID=%s: %v", u.ID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user"})
				return
			}
			log.Printf("UpsertUser: updated user ID=%s", u.ID)
		}

		c.JSON(http.StatusOK, gin.H{"user_id": u.ID, "role": u.Role})
	}
}
