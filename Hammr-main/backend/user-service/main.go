package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/hammr/backend/user-service/controllers"
	"github.com/hammr/backend/user-service/middleware"
	"github.com/hammr/backend/user-service/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=hammr_users port=5432 sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto Migrate
	db.AutoMigrate(&models.User{})

	r := gin.Default()

	authController := controllers.AuthController{DB: db}

	auth := r.Group("/auth")
	{
		auth.POST("/register", authController.Register)
		auth.POST("/login", authController.Login)
	}

	protected := r.Group("/users")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/profile", func(c *gin.Context) {
			userID, _ := c.Get("userID")
			c.JSON(200, gin.H{"user_id": userID, "message": "This is a protected route"})
		})
	}

	r.Run(":8081")
}
