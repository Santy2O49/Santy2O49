package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type ContractorProfile struct {
	ID             uuid.UUID      `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	UserID         uuid.UUID      `gorm:"type:uuid;not null;uniqueIndex"`
	Bio            string         `gorm:"type:text"`
	Skills         pq.StringArray `gorm:"type:text[]"`
	Experience     string         `gorm:"type:text"`
	Rating         float64        `gorm:"default:0"`
	ReviewCount    int            `gorm:"default:0"`
	IsVerified     bool           `gorm:"default:false"`
	IsOnDuty       bool           `gorm:"default:false"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      gorm.DeletedAt `gorm:"index"`
}
