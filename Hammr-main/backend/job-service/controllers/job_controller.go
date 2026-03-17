package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/hammr/backend/job-service/models"
	"gorm.io/gorm"
)

type JobController struct {
	DB *gorm.DB
}

type CreateJobInput struct {
	Title        string  `json:"title" binding:"required"`
	Description  string  `json:"description"`
	Category     string  `json:"category" binding:"required"`
	Budget       float64 `json:"budget" binding:"required"`
	LocationLat  float64 `json:"location_lat" binding:"required"`
	LocationLong float64 `json:"location_long" binding:"required"`
}

type UpdateJobStatusInput struct {
	Status models.JobStatus `json:"status" binding:"required"`
}

func (jc *JobController) CreateJob(c *gin.Context) {
	userIDStr, _ := c.Get("userID")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var input CreateJobInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	job := models.Job{
		ID:           uuid.New(),
		Title:        input.Title,
		Description:  input.Description,
		Category:     input.Category,
		Budget:       input.Budget,
		LocationLat:  input.LocationLat,
		LocationLong: input.LocationLong,
		ContracteeID: userID,
		Status:       models.JobStatusOpen,
	}

	if result := jc.DB.Create(&job); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create job"})
		return
	}

	c.JSON(http.StatusCreated, job)
}

func (jc *JobController) GetJobs(c *gin.Context) {
	var jobs []models.Job
	query := jc.DB

	// Filter by Category
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}

	// Filter by Status
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	if result := query.Find(&jobs); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch jobs"})
		return
	}

	c.JSON(http.StatusOK, jobs)
}

func (jc *JobController) GetJob(c *gin.Context) {
	id := c.Param("id")
	var job models.Job

	if result := jc.DB.First(&job, "id = ?", id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	c.JSON(http.StatusOK, job)
}

func (jc *JobController) UpdateJobStatus(c *gin.Context) {
	id := c.Param("id")
	var job models.Job

	if result := jc.DB.First(&job, "id = ?", id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	// Verify ownership (only contractee can change status for now, or contractor if accepted)
	// For simplicity, let's assume only the creator can change status for this iteration
	userIDStr, _ := c.Get("userID")
	if job.ContracteeID.String() != userIDStr.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to update this job"})
		return
	}

	var input UpdateJobStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	job.Status = input.Status
	jc.DB.Save(&job)

	c.JSON(http.StatusOK, job)
}
