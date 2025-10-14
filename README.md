
# 🛠️ DevOps Companion (Alpha)

**DevOps Companion** is a developer-oriented plugin that brings DevOps context awareness directly inside your Obsidian vault. It is currently under active development and not yet production-ready.

<a href='https://ko-fi.com/F2F21MIS45' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>



## 🚧 Status

> ⚠️ This plugin is in **alpha stage** and under active development. Features and structure may change frequently. Use at your own risk.

---

## ✨ Features

- 🔍 **Automatic Parsing** of common DevOps files:
  Automatically detect and parse popular DevOps configuration files:
  - **Docker**: `.yml`, `.yaml`, `Dockerfile`
  - **Terraform**: `.tf`
  - **CI/CD Pipelines**: `gitlab-ci.yml`, `github-actions.yml`
  - **Kubernetes / Helm** _(coming soon)_
  - **General configuration & environment files** (AI-only):  
    `.json`, `.env`, `.ini`, `.sh`
  
-  **Custom folder selection**: Choose a folder in your vault that will be watched and scanned.
-  **File import support**: Work with DevOps files not natively supported by Obsidian (e.g., `.tf`, `.yml`) via custom path setting.
-  **Manual scan command**: Instantly parse and analyze all matching files.
-  **Live monitoring**: Detects changes in your chosen folder and re-parses files.
-  **Documentation foundation**: Future versions will auto-generate clean, structured Markdown documentation.

---
### 🤖 AI-Powered Documentation

Bring clarity to your infrastructure.  
DevOps Companion can use AI to **rewrite, enhance, and explain** your technical files in Markdown — directly inside Obsidian.

Supported AI providers:

|Provider|Description|
|---|---|
|🧠 **OpenAI**|GPT-4, GPT-4o-mini, and compatible models|
|🧩 **Google Gemini**|Free API access via Google AI Studio|
|🪶 **Anthropic Claude**|High-context reasoning for documentation|
|⚡ **Mistral AI**|Lightweight, fast, and privacy-focused|

You can select your **preferred provider** in the plugin settings and add multiple API keys.

- Use the **“🧪 Test Connection”** button to verify your selected provider’s key works correctly.

The plugin automatically checks the appropriate endpoint (e.g., OpenAI, Google, Claude, or Mistral) and confirms if your credentials are valid.

---

### 📁 Organized Output Structure

All generated Markdown documentation is neatly stored in subfolders:

```
Parsed/
 ├── Docker/
 ├── Terraform/
 ├── CI-CD/
 └── General/
```

Each folder groups documentation by file type, so your vault stays structured and clean.

---

## 🧩 How It Works

1. **Set a folder** in your vault where DevOps files (YAML, Terraform) are stored.
2. The plugin:
	- Scans this folder on launch.
	- Watches for modifications in supported file types.
	- Lets you trigger a scan manually at any time.
    - Enhances the content using AI if enabled.
3. You can also **import files** into this folder, even if Obsidian doesn't natively support them, and they will be parsed by the plugin.
4. Output Markdown is stored in the appropriate subfolder under /Parsed/.

---

## 📌 Commands

| Command             | Description                                                             |
| --------------------|-------------------------------------------------------------------------|
| `Scan DevOps File`  | Manually scans `.yml`, `.yaml`, and `.tf` files in the selected folder. |

---
## ⚙️ Settings

|Setting|Description|
|---|---|
|**DevOps Scan Folder**|Choose the folder to watch and analyze.|
|**AI Provider**|Select from OpenAI, Google Gemini, Anthropic Claude, or Mistral.|
|**API Keys**|Store API keys for each supported provider.|
|**Documentation Style**|Choose between `technical`, `educational`, or `executive` tones.|
|**Enable AI Mode**|Toggle automatic AI enrichment of parsed docs.|
|**Test Connection**|Validate the API key for your selected provider.|

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


## 🔮 Roadmap

- [X] Add multi-AI support (OpenAI, Google, Claude, Mistral)
- [X] Test connection button for API keys
- [X] AI documentation for .json, .env, .sh, .ini
- [X] Support for Kubernetes manifests and Helm charts
- [X] GitHub Actions / GitLab CI file parsing
- [ ] Markdown summary generation with syntax highlighting
- [ ] Import/export of external `.tf` and `.yaml` folders
- [X] **AI-powered documentation generation**
- [ ] Localization & multi-language documentation


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


