import {normalizePath, Notice, Plugin, TFile, TFolder} from 'obsidian';
import {DockerParser} from './parser/docker';
import {TerraformParser} from './parser/terraform';
import {Watcher} from './watcher';
import {AIDocumentationEnhancer} from "./parser/ai-doc";
import {DevOpsSettings, DEFAULT_SETTINGS, DevOpsSettingsTab} from './settings';

export default class DevOpsCompanionPlugin extends Plugin {
	settings: DevOpsSettings;
	watcher: Watcher;
	private processingFiles: Set<string> = new Set();

	async onload() {


		await this.loadSettings();
		this.addSettingTab(new DevOpsSettingsTab(this.app, this));

		// Start watcher
		if (this.settings.enableWatcher) {
			this.watcher = new Watcher(this.app, this);
			this.watcher.start();
		}


		// Manual scan command
		this.addCommand({
			id: 'scan-devops-file',
			name: 'Manually scan DevOps files (scan folder in settings)',
			callback: async () => {
				const folderPath = this.settings.scanPath || '';
				if (!folderPath || folderPath.trim().length === 0) {
					new Notice("⚠️ No scan folder set. Please configure the scan folder in plugin settings.");
					return;
				}

				const normalized = normalizePath(folderPath);
				const folder = this.app.vault.getAbstractFileByPath(normalized);

				if (!folder || !(folder instanceof TFolder)) {
					new Notice(`⚠️ Scan folder not found: ${normalized}`);
					return;
				}

				new Notice(`🔎 Scanning folder: ${normalized} ...`);
				const files = await this.collectFilesInFolder(folder);

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


	async processFile(file: TFile) {

		const path = file.path;

		// 🔒 Si le fichier est déjà en cours de traitement, on skip
		if (this.processingFiles.has(path)) {
			console.log(`⏳ Skipping ${path}, already being processed.`);
			return;
		}

		this.processingFiles.add(path);
		try {
			let markdown = "";
			let subfolder = "Parsed/General";
			const lowerName = file.name.toLowerCase();
			//  Parse based on file type
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
				// All other file types handled by AI only
				const content = await this.app.vault.read(file);
				markdown = `# 📄 ${file.name}\n\n\`\`\`\n${content}\n\`\`\`\n`;
			}

			//  AI enrichment
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

			// Determine correct folder for documentation
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


			//  Save generated documentation
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
		} catch (err) {
			console.error(`❌ Error processing ${file.path}:`, err);
		} finally {
			this.processingFiles.delete(path);
			console.log(`✅ Done processing ${path}`);
		}
	}


	public async processFileLite(file: TFile) {
		const path = file.path;
		//  Si le fichier est déjà en cours de traitement, on skip
		if (this.processingFiles.has(path)) {
			console.log(`⏳ Skipping ${path}, already being processed.`);
			return;
		}
		this.processingFiles.add(path);

		try {
			let markdown = "";

			if (file.extension === "yml" || file.extension === "yaml") {
				markdown = await new DockerParser(this.app, this.settings).parseFile(file);
			} else if (file.extension === "tf") {
				markdown = await new TerraformParser(this.app, this.settings).parseFile(file);
			} else {
				console.log(`⚠️ Skipped unsupported file type: ${file.extension}`);
				return;
			}


			let subfolder = "Parsed";

			const lowerName = file.name.toLowerCase();
			if (file.extension === "tf") {
				subfolder = this.settings.outputPathTerraform.length > 0
					? this.settings.outputPathTerraform
					: "Parsed/Terraform";
			} else if (file.extension === "yml" || file.extension === "yaml") {
				subfolder = this.settings.outputPathDocker.length > 0
					? this.settings.outputPathDocker
					: "Parsed/Docker";
			} else if (lowerName.includes("gitlab-ci") || lowerName.includes("github")) {
				subfolder = "Parsed/CI-CD";
			} else {
				subfolder = "Parsed/General";
			}

			//  Save generated documentation

			await this.ensureFolderExists(subfolder);
			const outputPath = `${subfolder}${file.basename}.md`;
			const existingFile = this.app.vault.getAbstractFileByPath(outputPath);

			if (existingFile) {
				await this.app.vault.modify(existingFile as TFile, markdown);
			} else {
				await this.app.vault.create(outputPath, markdown);
			}
		} catch (err) {
			console.error(`❌ Error processing ${file.path}:`, err);
		} finally {
			this.processingFiles.delete(path);
			console.log(`✅ Done processing ${path}`);
		}
	}


	private async ensureFolderExists(folderPath: string) {
		try {
			const folder = this.app.vault.getAbstractFileByPath(folderPath);

			if (folder) {
				// Folder exists, nothing to do
				return;
			}

			//  Double check using adapter (reads directly from disk)
			const existsOnDisk = await this.app.vault.adapter.exists(folderPath);
			if (existsOnDisk) {
				return;
			}

			// 🆕 Create folder safely
			await this.app.vault.createFolder(folderPath);
		} catch (err: any) {
			if (err?.message?.includes("already exists")) {
				console.warn(`⚠️ Folder already exists: ${folderPath}`);
				return;
			}
			console.error("❌ Failed to ensure folder exists:", err);
		}
	}


	/**
	 * Recursively collect all TFile inside a TFolder
	 */
	private async collectFilesInFolder(folder: TFolder): Promise<TFile[]> {
		const result: TFile[] = [];

		const walk = (f: TFolder | TFile) => {
			if (f instanceof TFile) {
				result.push(f);
			} else if (f instanceof TFolder) {
				for (const child of f.children) {
					// child can be TFile or TFolder
					walk(child);
				}
			}
		};

		walk(folder);
		return result;
	}
}
