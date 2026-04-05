# Solar Energy Prediction Platform

A full-stack web application for predicting solar energy generation using machine learning models. This platform integrates ML pipelines with a REST API and interactive frontend for real-time energy predictions and analysis.

## 🌟 Features

- **ML-Powered Predictions:** XGBoost and other tree-based models with 97.78% accuracy
- **REST API:** Express.js backend for model serving and data management
- **Interactive Dashboard:** React frontend for visualization and predictions
- **Model Tracking:** MLflow integration for experiment management
- **Docker Deployment:** Containerized services for easy deployment
- **Real-time Updates:** WebSocket support for live data streaming
- **Scalable Architecture:** Microservices-based design

## 📚 Tech Stack

### Backend
- **Framework:** Express.js (Node.js)
- **Database:** Prisma ORM with relational database
- **ML Service:** Python with scikit-learn, XGBoost, and pandas
- **Model Tracking:** MLflow

### Frontend
- **Framework:** React
- **Build Tool:** Vite
- **Server:** Nginx
- **Real-time:** WebSocket support

### DevOps
- **Containerization:** Docker & Docker Compose
- **Orchestration:** Docker Compose

## 📂 Project Structure

```
Solar_energy_prediction/
├── express-api/               # REST API backend
│   ├── src/
│   │   ├── index.js          # Server entry point
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   └── services/         # Business logic
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── Dockerfile
├── frontend/                  # React web application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── App.jsx
│   │   └── socket.js         # WebSocket client
│   ├── nginx.conf            # Nginx configuration
│   └── Dockerfile
├── ml-service/               # Python ML service
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── predict.py        # Prediction logic
│   │   ├── db.py             # Database utilities
│   │   ├── cache.py          # Caching utilities
│   │   ├── mlflow_tracker.py # MLflow integration
│   │   └── feature_schema.py # Feature schemas
│   ├── requirements.txt
│   └── Dockerfile
├── models/                    # Trained ML models
│   └── sklearn/
│       ├── best_xgboost.joblib
│       └── scaler.joblib
├── notebooks/                 # Jupyter notebooks
│   ├── 01_preprocessing.ipynb
│   ├── 02_sklearn_models.ipynb
│   └── test.ipynb
├── data/                      # Datasets
│   ├── HEEW-20250912/        # Raw & cleaned energy data
│   ├── processed/            # Train & test splits
│   └── Wind and solar power generation dataset/
├── mlflow/                    # MLflow tracking server
├── docker-compose.yml        # Orchestration
└── README.md
```

## Datasets

The project utilizes the following datasets for solar and wind power generation prediction, energy consumption, and weather analysis:

### 1. Wind and Solar Power Generation Dataset

This dataset provides data on wind and solar power generation.

- **Citation:** Liu, Yue (2024), "Wind and solar power generation dataset", Mendeley Data, V1, doi: 10.17632/gxc6j5btrx.1
- **Link:** [Mendeley Data](https://data.mendeley.com/datasets/gxc6j5btrx/1)

### 2. HEEW (Hierarchical Dataset on Multiple Energy Consumption, PV Generation, Emissions, and Weather Information)

A comprehensive dataset containing ~12 million hourly records from 2014 to 2022. It includes variables for energy consumption (electricity, heat, cooling), photovoltaic (PV) generation, greenhouse gas emissions, and detailed weather information (temperature, humidity, wind speed/gust, pressure, precipitation) across individual buildings and communities.

- **Citation:** Dong, H., Zhu, J., & Chung, C. Y. (2025). HEEW, a Hierarchical Dataset on Multiple Energy Consumption, PV Generation, Emissions, and Weather Information. figshare. https://doi.org/10.6084/m9.figshare.28425647
- **Link:** [figshare](https://springernature.figshare.com/articles/dataset/HEEW_a_Hierarchical_Dataset_on_Multiple_Energy_Consumption_PV_Generation_Emissions_and_Weather_Information/28425647?file=57947407)

## Processed Data

**Location:** `data/processed/`

| Split    | File        | Size    | Records       |
| -------- | ----------- | ------- | ------------- |
| Training | `train.csv` | ~882 MB | ~3.04 Million |
| Testing  | `test.csv`  | ~251 MB | ~873K         |

- **Transformations applied:** Merged raw data, handled missing values (NaNs), and structured for comparative modeling.

## Model Performance 🚀

A comparison of baseline and tree-based models evaluated directly on the test set (`~873K` records).

**Key Takeaways:**

- 🏆 **Top Performer:** `XGBoost` achieves the highest accuracy ($R^2$ = **0.9778**) with very low error and quick training execution.
- ⚡ **Fastest Training:** `Ridge Regression` trained in just **2.8 seconds**.
- ⚠️ **Slowest Training:** `Random Forest` took the longest to train (**~19 minutes**) with slightly lower accuracy than XGBoost.

### Evaluation Metrics Overview

| Model                 | $R^2$ Score |    MAE     |    RMSE    |  MAPE (%)  | Train Time (s) |
| :-------------------- | :---------: | :--------: | :--------: | :--------: | :------------: |
| **XGBoost**           | **0.9778**  | **0.0128** | **0.0327** | **18.63%** |      49.2      |
| **Random Forest**     |   0.9755    |   0.0130   |   0.0343   |   19.71%   |     1148.8     |
| **SVR (RBF)**         |   0.9697    |   0.0170   |   0.0382   |   22.54%   |     1007.8     |
| **Linear Regression** |   0.9465    |   0.0297   |   0.0508   |   42.24%   |      17.6      |
| **Ridge Regression**  |   0.9465    |   0.0297   |   0.0508   |   42.24%   |    **2.8**     |

> _Note: Higher $R^2$ indicates a better fit, while lower MAE, RMSE, and MAPE specify lower prediction error. Metrics are rounded for visual clarity._

## 🚀 Getting Started

### Prerequisites

Before running the project, ensure you have the following installed:

- **Docker** (v20.10+) and **Docker Compose** (v2.0+)
- **Node.js** (v16+) and npm
- **Python** (v3.8+)
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Solar_energy_prediction
   ```

2. **Install dependencies (optional, Docker handles most):**
   
   For local development without Docker:
   
   **Backend:**
   ```bash
   cd express-api
   npm install
   ```
   
   **Frontend:**
   ```bash
   cd frontend
   npm install
   ```
   
   **ML Service:**
   ```bash
   cd ml-service
   pip install -r requirements.txt
   ```

## 🐳 Running the Project

### Using Docker Compose (Recommended)

The entire application stack can be run with a single command:

```bash
docker-compose up --build
```

This will start all services:
- **Express API:** http://localhost:3000
- **Frontend:** http://localhost:80 (or http://localhost:5173 in dev)
- **ML Service:** http://localhost:8000
- **MLflow Tracking:** http://localhost:5000

To stop the services:
```bash
docker-compose down
```

### Local Development

**Start ML Service:**
```bash
cd ml-service
python -m uvicorn app.main:app --reload --port 8000
```

**Start Backend API:**
```bash
cd express-api
npm start
```

**Start Frontend (in another terminal):**
```bash
cd frontend
npm run dev
```

## 📡 API Endpoints

The Express API provides the following endpoints (for more details, check `express-api/src/routes/`):

### Base URL
```
http://localhost:3000/api
```

### Prediction Endpoints
- `POST /predict` - Get energy prediction
- `GET /predictions/:id` - Fetch prediction history

### Data Endpoints
- `GET /data` - Retrieve dataset information
- `POST /data/upload` - Upload new data

### Health Check
- `GET /health` - Server status

For detailed API documentation, see the [Express API README](./express-api/README.md).

## 🔄 Workflow

1. **Data Preprocessing:** Raw data is cleaned and transformed in Jupyter notebooks (`notebooks/01_preprocessing.ipynb`)
2. **Model Training:** Multiple ML models are trained and evaluated (`notebooks/02_sklearn_models.ipynb`)
3. **Model Storage:** Best-performing models are saved to `models/sklearn/`
4. **Deployment:** ML models are served via the Python ML service
5. **API Layer:** Express.js API handles requests and queries predictions
6. **Frontend:** React dashboard visualizes predictions and historical data

## 📊 Model Details

### Featured Model: XGBoost

The production model is **XGBoost** due to its superior performance:
- **Accuracy:** 97.78% ($R^2$)
- **Mean Absolute Error:** 0.0128
- **Training Time:** 49.2 seconds
- **Scalability:** Handles 873K+ test records efficiently

**Model Location:** `models/sklearn/best_xgboost.joblib`

### Feature Scaling

A StandardScaler is applied to normalize input features:
**Location:** `models/sklearn/scaler.joblib`

## 📝 Development

### Project Structure Breakdown

#### Express API (`express-api/`)
- RESTful API built with Express.js
- Database ORM with Prisma
- WebSocket support for real-time updates
- Middleware for authentication, error handling

#### Frontend (`frontend/`)
- React single-page application
- Vite for fast build and HMR
- Component-based architecture
- WebSocket client for live updates

#### ML Service (`ml-service/`)
- Python service for model predictions
- FastAPI or similar framework
- Model loading and inference
- Feature preprocessing

#### Notebooks (`notebooks/`)
- **01_preprocessing.ipynb** - Data cleaning and EDA
- **02_sklearn_models.ipynb** - Model training and evaluation
- **test.ipynb** - Quick testing and experimentation

## 🔧 Configuration

### Environment Variables

Create `.env` files in respective directories:

**express-api/.env:**
```
DATABASE_URL=your_database_url
PORT=3000
ML_SERVICE_URL=http://ml-service:8000
```

**ml-service/.env:**
```
MODEL_PATH=./models/sklearn/best_xgboost.joblib
SCALER_PATH=./models/sklearn/scaler.joblib
```

## 📈 MLflow Tracking

Model experiments and metrics are tracked using MLflow:

```bash
# Access MLflow UI (when running docker-compose)
open http://localhost:5000
```

View model parameters, metrics, and artifacts from training runs.

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 📧 Contact & Support

For questions or issues, please open an issue on the repository or contact the development team.

---

**Last Updated:** April 2026  
**Version:** 1.0.0
