# solar-prediction-platform

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

| Split | File | Size | Records |
|-------|------|------|---------|
| Training | `train.csv` | ~882 MB | ~3.04 Million |
| Testing | `test.csv` | ~251 MB | ~873K |

- **Transformations applied:** Merged raw data, handled missing values (NaNs), and structured for comparative modeling.
