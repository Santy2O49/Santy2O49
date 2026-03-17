package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/hammr/backend/contractor-service/controllers"
	"github.com/hammr/backend/contractor-service/middleware"
	"github.com/hammr/backend/contractor-service/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=hammr_contractors port=5432 sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto Migrate
	db.AutoMigrate(&models.ContractorProfile{})

	r := gin.Default()

	profileController := controllers.ProfileController{DB: db}

	protected := r.Group("/contractors")
	protected.Use(middleware.AuthMiddleware())
	protected.Use(middleware.ContractorOnly())
	{
		protected.POST("/profile", profileController.CreateProfile)
		protected.GET("/profile", profileController.GetProfile)
		protected.PUT("/profile", profileController.UpdateProfile)
	}

	r.Run(":8082")
}
