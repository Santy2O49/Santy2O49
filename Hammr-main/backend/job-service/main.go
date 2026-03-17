package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/hammr/backend/job-service/controllers"
	"github.com/hammr/backend/job-service/middleware"
	"github.com/hammr/backend/job-service/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=hammr_jobs port=5432 sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto Migrate
	db.AutoMigrate(&models.Job{})

	r := gin.Default()

	jobController := controllers.JobController{DB: db}

	// Public routes (if any)
	r.GET("/jobs", jobController.GetJobs)
	r.GET("/jobs/:id", jobController.GetJob)

	// Protected routes
	protected := r.Group("/jobs")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/", jobController.CreateJob)
		protected.PUT("/:id/status", jobController.UpdateJobStatus)
	}

	r.Run(":8083")
}
