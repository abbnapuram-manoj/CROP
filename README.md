# 🌾 CROP - Crop Recommendation and Optimization Platform

A comprehensive web application that recommends suitable crops based on soil conditions, climate parameters, and agricultural data.

## 📋 Features

- **Smart Crop Recommendation**: Get personalized crop suggestions based on:
  - Soil type (Black, Red, Clay, Sandy)
  - Rainfall patterns
  - Temperature conditions
  - Soil pH levels

- **Scoring Engine**: Intelligent algorithm that evaluates crop compatibility
- **Responsive UI**: Modern, user-friendly interface built with React
- **RESTful API**: Express backend with CSV data support

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

1. **Backend Setup**
```bash
cd backend
npm install
npm start
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
CROP/
├── backend/
│   ├── data/crops.csv          # Main crop dataset
│   ├── utils/loader.js         # CSV loader utility
│   ├── logic.js                # Scoring engine
│   ├── server.js               # Express API
│   └── .env                    # Environment config
│
├── frontend/
│   ├── public/
│   │   ├── img1.jpg           # Background image
│   │   ├── crops/             # Crop images
│   │   └── soils/             # Soil textures
│   │
│   ├── src/
│   │   ├── App.jsx            # Main routing
│   │   ├── Home.jsx           # Input form
│   │   ├── Results.jsx        # Results display
│   │   └── index.css          # Global styles
│   │
│   └── vite.config.js         # Vite configuration
│
└── README.md                   # This file
```

## 🔧 API Endpoints

### POST /api/recommend
Get crop recommendations based on soil conditions.

**Request:**
```json
{
  "soil": "Black",
  "rainfall": 1500,
  "temperature": 25,
  "ph": 6.5
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "crop": "Rice",
      "score": 95,
      "recommendations": ["Ensure proper irrigation", "Monitor pH levels"]
    }
  ]
}
```

## 🛠️ Technologies Used

### Backend
- Express.js - REST API framework
- Node.js - Runtime environment
- csv-parser - CSV data handling

### Frontend
- React - UI framework
- Vite - Build tool
- Tailwind CSS - Styling
- PostCSS - CSS processing

## 📊 Dataset

The `crops.csv` file contains:
- Crop names
- Soil type compatibility
- Rainfall requirements (min-max)
- Temperature range
- pH range
- Nutrient requirements

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available for educational purposes.

## 👨‍💻 Author

Created by abbnapuram-manoj

## 📞 Support

For issues or questions, please create a GitHub issue in this repository.

---

**Last Updated**: 2026-04-06