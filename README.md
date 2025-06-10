
# 🛠️ Obsidian DevOps Companion (Alpha)

**Obsidian DevOps Companion** is a developer-oriented plugin that brings DevOps context awareness directly inside your Obsidian vault. It is currently under active development and not yet production-ready.

## 🚧 Status

> ⚠️ This plugin is in **alpha stage** and under active development. Features and structure may change frequently. Use at your own risk.

---

## ✨ Features

- 🔍 **Automatic Parsing** of common DevOps files:
  - `Dockerfile` (via `.yml`, `.yaml`)
  - Terraform configurations (`.tf`)
-  **Custom folder selection**: Choose a folder in your vault that will be watched and scanned.
-  **File import support**: Work with DevOps files not natively supported by Obsidian (e.g., `.tf`, `.yml`) via custom path setting.
-  **Manual scan command**: Instantly parse and analyze all matching files.
-  **Live monitoring**: Detects changes in your chosen folder and re-parses files.
-  **Documentation foundation**: Future versions will auto-generate clean, structured Markdown documentation.

---

## 🧩 How It Works

1. **Set a folder** in your vault where DevOps files (YAML, Terraform) are stored.
2. The plugin:
	- Scans this folder on launch.
	- Watches for modifications in supported file types.
	- Lets you trigger a scan manually at any time.
3. You can also **import files** into this folder, even if Obsidian doesn't natively support them, and they will be parsed by the plugin.
4. Parsed content will eventually be transformed into **summarized Markdown** documents.

---

## 🛠️ Installation (Developer Mode)

1. Clone the repo into your Obsidian `.obsidian/plugins/` folder:
   ```bash
   git clone https://github.com/jkom4/obsidian-devops-companion.git
	```

2. Build the plugin (requires Node.js and npm):

   ```bash
   npm install
   npm run build
   ```
3. Enable the plugin in **Obsidian → Settings → Community Plugins**.

---

## ⚙️ Settings

- **DevOps Scan Folder**: Set the path in your vault that should be watched for DevOps files.
- Future settings will allow:
	- Toggling real-time monitoring.
	- Enabling/disabling specific parsers.
	- Output directory for generated docs.
---

## 📌 Commands

| Command             | Description                                                             |
| --------------------|-------------------------------------------------------------------------|
| `Scan DevOps File`  | Manually scans `.yml`, `.yaml`, and `.tf` files in the selected folder. |

---

## 🔮 Roadmap

- [ ] Support for Kubernetes manifests and Helm charts
- [ ] GitHub Actions / GitLab CI file parsing
- [ ] Markdown summary generation with syntax highlighting
- [ ] Import/export of external `.tf` and `.yaml` folders
- [ ] **AI-powered documentation generation**
- [ ] Interactive UI for viewing parsed summaries inside Obsidian
- [ ] Multilanguage

---

## 🤝 Contributing

This project is experimental. Suggestions, issues, and pull requests are welcome.

---

## 📜 License

MIT — Free to use and modify.

---

## 👤 Author

Created by [Jobelin Kom](https://www.linkedin.com/in/jobelin-kom/) – bringing DevOps into your second brain.

Found a bug? Have feature ideas?

📧 [My Email](mailto://jkom4dev@gmail.com)
```

