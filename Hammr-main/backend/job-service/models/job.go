package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type JobStatus string

const (
	JobStatusOpen       JobStatus = "OPEN"
	JobStatusInProgress JobStatus = "IN_PROGRESS"
	JobStatusCompleted  JobStatus = "COMPLETED"
	JobStatusCancelled  JobStatus = "CANCELLED"
)

type Job struct {
	ID           uuid.UUID      `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	Title        string         `gorm:"not null"`
	Description  string         `gorm:"type:text"`
	Category     string         `gorm:"not null"`
	Budget       float64        `gorm:"not null"`
	Status       JobStatus      `gorm:"default:'OPEN'"`
	LocationLat  float64        `gorm:"not null"`
	LocationLong float64        `gorm:"not null"`
	ContracteeID uuid.UUID      `gorm:"type:uuid;not null;index"`
	ContractorID *uuid.UUID     `gorm:"type:uuid;index"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    gorm.DeletedAt `gorm:"index"`
}
