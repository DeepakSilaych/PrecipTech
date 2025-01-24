

#### **1. Homepage**
- **Purpose**: Introduce the tool and let users quickly start working.
- **Key Elements**:
  - Brief description of the tool and its methods.
  - Two main buttons:
    - **"Start Analyzing"**: Takes users to the main tool.
    - **"Learn More"**: Shows a pop-up/modal explaining the methods.

---

#### **2. Main Tool Page** (Single-page interface)
This page integrates all the functionalities to keep navigation minimal.

##### **Sections on the Main Tool Page**:
1. **Map Area**:
   - An interactive map (using leaflet.js) for:
     - Dropping pins to add stations.
     - Drawing isohyets for the Isohyetal method.
     - Auto-generating Theissen polygons for selected stations.
   - Pins represent station data (precipitation, coordinates).

2. **Data Panel** (Sidebar or collapsible section):
   - **Upload Data**: Upload CSV files containing station data (coordinates, precipitation, etc.).
   - **Manually Add Data**: Form to add stations by entering:
     - Coordinates (absolute or relative).
     - Precipitation values (if available).
   - View or Edit existing station data (stored in localStorage).

3. **Method Selection**:
   - Dropdown menu to select the desired method:
     - **Arithmetic Mean**.
     - **Normal Ratio**.
     - **Inverse Distance Weighting**.
     - **Isohyetal Method**.
     - **Theissen Polygon Method**.
   - Once a method is selected:
     - Additional inputs (if needed) are displayed dynamically (e.g., normal precipitation for the Normal Ratio method).
     - Map and results area update in real-time.

4. **Results Section**:
   - Dynamically update this section to show:
     - Calculated results (e.g., missing data, area averages).
     - Visualization (graphs using Chart.js or D3.js, and overlays on the map).
   - Include a "Download Results" button to save outputs as a CSV.

---

### **Website Interaction Flow**

1. **Start Analyzing**:
   - User lands on the **Main Tool Page**.
   - Can either upload a CSV file or manually enter station data.

2. **Add Stations**:
   - Drop pins on the map or enter coordinates in the form.
   - For relative coordinates, the map adjusts to reflect positions dynamically.

3. **Select Method**:
   - User selects a method from the dropdown.
   - Additional fields are displayed if required (e.g., normal precipitation for the Normal Ratio method).
   - Perform the calculation based on selected inputs.

4. **View Results**:
   - The map updates visually:
     - Isohyets are drawn for the Isohyetal method.
     - Polygons are generated for the Theissen method.
     - Missing data is displayed for Arithmetic Mean, Normal Ratio, and IDW.
   - Graphs/charts appear in the Results Section.

5. **Download or Reset**:
   - Users can download the results.
   - Option to reset the map or start a new analysis.

