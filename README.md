
## Features

- **Interactive Map**: Real-time visualization of FRA claims using government APIs
- **Claims Management**: Simple and efficient claims tracking system  
- **Document Digitization**: AI-powered OCR with multi-language support
- **Satellite Asset Mapping**: Land-use classification and temporal analysis
- **Decision Support System**: AI-powered government scheme matching

## Tech Stack

### Frontend
- React 18.3.1 with TypeScript
- Leaflet for interactive mapping
- Vite for development and building
- Tailwind CSS for styling

### Backend  
- FastAPI with Python
- uvicorn ASGI server
- SQLite/PostgreSQL database support
- OCR and AI processing services

## Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Docker Compose (Alternative)
```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/docs

## API Integration

The system integrates with real government APIs from data.gov.in for authentic FRA data visualization and processing.

## Government Data Sources

- Ministry of Tribal Affairs FRA APIs
- Real-time claims data (2017-2024)
- State-wise forest rights statistics
- Individual and community claims tracking

## License

This project is developed for Smart India Hackathon 2024.
