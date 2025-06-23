package model

import "time"

type User struct {
	ID            string `gorm:"primaryKey"`
	Username      string `gorm:"uniqueIndex;not null"`
	PasswordHash  string `gorm:"not null"`
	Role          string `gorm:"not null"`
	StudentID     string `gorm:"unique"`
	InstitutionID string `gorm:"index"` // Add institution_id field
	CreatedAt     time.Time
	UpdatedAt     time.Time
	Institution   string //for instructors
}
