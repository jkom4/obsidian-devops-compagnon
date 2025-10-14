// ==============================
// Obsidian DevOps Companion Plugin
// ==============================

import {Notice, Plugin, TFile} from 'obsidian';
import { DockerParser } from './parser/docker';
import { TerraformParser } from './parser/terraform';
import { Watcher } from './watcher';
import { AIDocumentationEnhancer } from "./parser/ai-doc";
import { DevOpsSettings, DEFAULT_SETTINGS, DevOpsSettingsTab } from './settings';

export default class DevOpsCompanionPlugin extends Plugin {
	settings: DevOpsSettings;
	watcher: Watcher;

	async onload() {

		// Load settings and settings tab
		await this.loadSettings();
		this.addSettingTab(new DevOpsSettingsTab(this.app, this));

		// Start watcher
		this.watcher = new Watcher(this.app, this.settings);
		this.watcher.start();

		// Manual scan command
		this.addCommand({
			id: 'scan-devops-file',
			name: 'Manually scan DevOps files',
			callback: async () => {
				const files = this.app.vault.getFiles();
				for (const file of files) {
					await this.processFile(file);
				}
				new Notice("✅ Manual scan completed.");
			}
		});
	}

	onunload() {
		console.log('DevOps Companion Plugin unloaded.');
		this.watcher.stop();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// ============================================
	// 🧩 Centralized file processing logic
	// ============================================
	async processFile(file: TFile) {
		let markdown = "";
		let subfolder = "Parsed/General";
		const lowerName = file.name.toLowerCase();

		// 1️⃣ Parse based on file type
		if (file.extension === "yml" || file.extension === "yaml") {
			markdown = await new DockerParser(this.app, this.settings).parseFile(file);
			subfolder = this.settings.outputPathDocker.length > 0
				? this.settings.outputPathDocker
				: "Parsed/Docker";

		} else if (file.extension === "tf") {
			markdown = await new TerraformParser(this.app, this.settings).parseFile(file);
			subfolder = this.settings.outputPathTerraform.length > 0
				? this.settings.outputPathTerraform
				: "Parsed/Terraform";

		} else {
			// 🧠 All other file types handled by AI only
			const content = await this.app.vault.read(file);
			markdown = `# 📄 ${file.name}\n\n\`\`\`\n${content}\n\`\`\`\n`;
		}

		// 2️⃣ AI enrichment (optional)
		if (this.settings.enableAI && this.settings.preferredProvider) {
			try {
				const enhancer = new AIDocumentationEnhancer(
					this.settings,
					this.settings.documentationStyle
				);
				markdown = await enhancer.enhanceDocumentation(markdown);
				console.log(`🧠 AI enrichment completed for ${file.name}`);
			} catch (err) {
				console.warn("❌ AI enhancement failed:", err);
				new Notice("AI enhancement failed — check console for details.");
			}
		}

		// 3️⃣ Determine correct folder for documentation
		if (lowerName.includes("gitlab-ci") || lowerName.includes("github")) {
			subfolder = "Parsed/CI-CD";
		} else if (file.extension === "json") {
			subfolder = "Parsed/Configs";
		} else if (file.extension === "env") {
			subfolder = "Parsed/Environment";
		} else if (file.extension === "ini") {
			subfolder = "Parsed/Configs";
		} else if (file.extension === "sh" || lowerName.includes("dockerfile")) {
			subfolder = "Parsed/Docker";
		}


		// 4️⃣ Save generated documentation
		try {
			await this.ensureFolderExists(subfolder);
			const outputPath = `${subfolder}/${file.basename}.md`;
			const existingFile = this.app.vault.getAbstractFileByPath(outputPath);

			if (existingFile) {
				await this.app.vault.modify(existingFile as TFile, markdown);
				console.log(`✏️ Updated documentation for ${file.path}`);
			} else {
				await this.app.vault.create(outputPath, markdown);
				console.log(`📘 Created documentation for ${file.path}`);
			}
		} catch (error) {
			console.warn("❌ Error writing documentation file:", error);
		}
	}

	private async ensureFolderExists(folderPath: string) {
		const folder = this.app.vault.getAbstractFileByPath(folderPath);
		if (!folder) {
			await this.app.vault.createFolder(folderPath);
		}
	}
}
