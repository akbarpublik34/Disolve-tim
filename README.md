# Disolve-tim
Healthon

# 🏥 Disolve-tim: Healthon  
### Medical Case Repository

A web-based application for medical practitioners to store, manage, and update medical case reports.

---

## ✨ Features

- 📊 **Dashboard:** View all cases with summary statistics  
- ➕ **Add Cases:** Create new medical case reports  
- ✏️ **Edit Cases:** Update existing case information  
- 👁️ **View Cases:** Detailed view of case information  
- 🔍 **Search:** Find cases by patient name, diagnosis, or case ID  
- 💾 **Local Storage:** Data stored safely in the browser’s localStorage  
- 📱 **Responsive Design:** Works seamlessly on desktop, tablet, and mobile devices  

---

## 🧱 Project Structure

```
medicalCaseRepo/
│
├── index.html                  # Main dashboard
├── README.md                   # Project documentation
│
├── assets/
│   ├── css/
│   │   ├── mainStyle.css       # Main styling
│   │   └── formStyle.css       # Form-specific styling
│   │
│   └── js/
│       ├── mainScript.js       # Core functionality
│       └── caseEditor.js       # Add/Edit case logic
│
└── pages/
    ├── addCase.html            # Add new case form
    ├── editCase.html           # Edit existing case form
    └── viewCase.html           # View case details
```

---

## ⚙️ Installation

Clone or download this repository.  
No installation required — pure HTML, CSS, and JavaScript.

```bash
# Clone the repository
git clone https://github.com/yourusername/medicalCaseRepo.git

# Navigate to the directory
cd medicalCaseRepo

# Open in browser
# On Linux/Mac
open index.html

# On Windows
start index.html
```

---

## 🚀 Usage

### 🏠 Dashboard
- View all medical cases in a card layout  
- See statistics: **Total Cases**, **Recent Cases (last 30 days)**, **Active Cases**  
- Search for cases using the search bar  
- Click **View** to see full case details  
- Click **Edit** to modify a case  

### ➕ Adding a New Case
1. Click **Add Case** in the navigation.  
2. Fill in all required fields:
   - Patient Name  
   - Age  
   - Gender  
   - Diagnosis  
   - Case Description  
   - Status (Active / Closed)  
3. Optionally add:
   - Treatment Plan  
   - Additional Notes  
4. Click **Save Case**.

### ✏️ Editing a Case
- Click **Edit** on any case card or from the case detail view.  
- Modify the information and click **Update Case**.  

### 👁️ Viewing Case Details
- Click **View** on any case card.  
- See complete case information.  
- Option to **Edit** or **Delete** the case.  

### 🗑️ Deleting a Case
- Open the case detail view.  
- Click **Delete** and confirm.  

---

## 💾 Data Storage

All data is stored in the browser's `localStorage`.  

✅ No server required  
✅ Data persists between sessions  

⚠️ Data is stored locally on each device  
⚠️ Clearing browser data will delete all cases  
⚠️ Data is not shared between browsers or devices  

---

## 🌐 Browser Compatibility

- Chrome / Edge (✅ Recommended)  
- Firefox  
- Safari  
- Opera  

Requires a modern browser with **ES6+ JavaScript** and **localStorage API** support.

---

## 🧰 Technologies Used

- **HTML5:** Structure and semantic markup  
- **CSS3:** Styling with CSS Grid, Flexbox, and custom properties  
- **Vanilla JavaScript (ES6+):** Frontend functionality  
- **LocalStorage API:** Data persistence  

---

## 🔮 Future Enhancements

- Backend integration with a database  
- User authentication  
- Export cases to PDF  
- Image upload for medical imaging  
- Case categories/tags  
- Advanced filtering  
- Print functionality  
- Data backup/restore  

---

## 🤝 Contributing

Contributions are welcome!  
Feel free to submit **issues** and **pull requests** to improve the project.

---

## 🪪 License

**MIT License**  
Free to use for personal or commercial purposes.

---

## 👨‍⚕️ Author

  
*Medical Case Repository Developer*  

---

## 🙏 Acknowledgments

Built for **medical practitioners** to simplify case management and documentation.
