package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/hammr/backend/contractor-service/models"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type ProfileController struct {
	DB *gorm.DB
}

type CreateProfileInput struct {
	Bio        string   `json:"bio"`
	Skills     []string `json:"skills"`
	Experience string   `json:"experience"`
}

type UpdateProfileInput struct {
	Bio        string   `json:"bio"`
	Skills     []string `json:"skills"`
	Experience string   `json:"experience"`
	IsOnDuty   *bool    `json:"is_on_duty"`
}

func (pc *ProfileController) CreateProfile(c *gin.Context) {
	userIDStr, _ := c.Get("userID")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var input CreateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	profile := models.ContractorProfile{
		ID:         uuid.New(),
		UserID:     userID,
		Bio:        input.Bio,
		Skills:     pq.StringArray(input.Skills),
		Experience: input.Experience,
	}

	if result := pc.DB.Create(&profile); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create profile"})
		return
	}

	c.JSON(http.StatusCreated, profile)
}

func (pc *ProfileController) GetProfile(c *gin.Context) {
	userIDStr, _ := c.Get("userID")
	
	var profile models.ContractorProfile
	if result := pc.DB.Where("user_id = ?", userIDStr).First(&profile); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

func (pc *ProfileController) UpdateProfile(c *gin.Context) {
	userIDStr, _ := c.Get("userID")

	var profile models.ContractorProfile
	if result := pc.DB.Where("user_id = ?", userIDStr).First(&profile); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	var input UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields if provided
	if input.Bio != "" {
		profile.Bio = input.Bio
	}
	if len(input.Skills) > 0 {
		profile.Skills = pq.StringArray(input.Skills)
	}
	if input.Experience != "" {
		profile.Experience = input.Experience
	}
	if input.IsOnDuty != nil {
		profile.IsOnDuty = *input.IsOnDuty
	}

	pc.DB.Save(&profile)
	c.JSON(http.StatusOK, profile)
}
