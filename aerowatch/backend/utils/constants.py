"""Constants and thresholds for AeroWatch"""

# Severity levels and their anomaly score thresholds
SEVERITY_THRESHOLDS = {
    "NORMAL": (0, 20),
    "WATCH": (20, 40),
    "WARNING": (40, 60),
    "SEVERE": (60, 80),
    "EXTREME": (80, 100),
}

# Risk level thresholds
RISK_LEVELS = {
    "LOW": (0, 20),
    "MODERATE": (20, 40),
    "HIGH": (40, 60),
    "SEVERE": (60, 80),
    "EXTREME": (80, 100),
}

# Risk scoring weights
RISK_WEIGHTS = {
    "intensity": 0.30,
    "spatial_extent": 0.20,
    "persistence": 0.20,
    "growth_rate": 0.15,
    "forecast_confidence": 0.15,
}

# Hazard types
HAZARD_TYPES = [
    "extreme_rainfall",
    "heatwave",
    "extreme_wind",
    "cold_wave",
    "thunderstorm",
]

# Severity colors for frontend
SEVERITY_COLORS = {
    "NORMAL": "#66BB6A",
    "WATCH": "#FDD835",
    "WARNING": "#FB8C00",
    "SEVERE": "#E53935",
    "EXTREME": "#C62828",
}

# Indian states for demo data
INDIAN_STATES = [
    "Maharashtra",
    "Gujarat",
    "Rajasthan",
    "Karnataka",
    "Tamil Nadu",
    "Kerala",
    "Andhra Pradesh",
    "Telangana",
    "Madhya Pradesh",
    "Odisha",
    "West Bengal",
    "Bihar",
    "Uttar Pradesh",
    "Assam",
]

# Districts by state for demo data
DISTRICTS_BY_STATE = {
    "Maharashtra": ["Pune", "Mumbai", "Nashik", "Nagpur", "Thane", "Kolhapur", "Satara", "Ratnagiri", "Sindhudurg"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Kutch", "Junagadh", "Bharuch"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Bikaner", "Kota", "Ajmer", "Barmer"],
    "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubli", "Belgaum", "Dharwad"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Wayanad", "Idukki"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Puri", "Ganjam", "Balasore"],
    "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Sundarbans", "Midnapore"],
}

# Grid resolution for weather data (degrees)
GRID_RESOLUTION = 0.25

# Map bounds for India
INDIA_BOUNDS = {
    "min_lat": 6.0,
    "max_lat": 37.0,
    "min_lon": 68.0,
    "max_lon": 98.0,
    "center_lat": 20.5937,
    "center_lon": 78.9629,
}
