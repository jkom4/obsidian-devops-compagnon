// ==============================
// DevOpsSettings.ts - Plugin parameters
// ==============================
import {Notice, PluginSettingTab, Setting, TFile, TFolder} from "obsidian";
import DevOpsCompanionPlugin from "./main";

export interface DevOpsSettings {
	scanPath: string;
	openAIKey: string;
	googleAIKey: string;
	claudeKey: string;
	mistralKey: string;
	enableAI: boolean;
	preferredProvider: string;
	documentationStyle: "technical" | "educational" | "executive";
	enableDocker: boolean;
	enableTerraform: boolean;
	outputPathDocker: string;
	outputPathTerraform: string;
	useAIInWatcher: boolean;
	enableWatcher: boolean;
}

export const DEFAULT_SETTINGS: DevOpsSettings = {
	scanPath: 'DevOpsImports',
	enableDocker: true,
	enableTerraform: true,
	enableWatcher: false,

	openAIKey: "",
	googleAIKey: "",
	claudeKey: "",
	mistralKey: "",

	enableAI: false,
	useAIInWatcher: false,
	preferredProvider: "openai",
	documentationStyle: "technical",
	outputPathDocker: 'Parsed/Docker/',
	outputPathTerraform: 'Parsed/Terraform/',
};

export class DevOpsSettingsTab extends PluginSettingTab {
	plugin: DevOpsCompanionPlugin;

	constructor(app: any, plugin: DevOpsCompanionPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName('DevOps Companion settings').setHeading();
		new Setting(containerEl)
			.setName("Path of folder to be scanned")
			.setDesc("Specifies the vault subfolder where DevOps files (YML, TF) are to be retrieved.")
			.addText(text =>
				text
					.setPlaceholder("DevOpsImports")
					.setValue(this.plugin.settings.scanPath)
					.onChange(async (value) => {
						this.plugin.settings.scanPath = value.trim();
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Import DevOps files")
			.setDesc("Import one or more .yml / .yaml / .tf / .sh ...files into the vault.")
			.addButton(btn =>
				btn
					.setButtonText("Import...")
					.onClick(() => this.handleImport())
			);


		containerEl.createEl("h2", { text: " AI Configuration" });
		new Setting(containerEl)
			.setName("Enable AI Mode")
			.setDesc("If enabled, documentation will be enriched by AI.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableAI)
					.onChange(async (value) => {
						this.plugin.settings.enableAI = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Preferred AI Provider")
			.setDesc("Choose which AI provider to use for documentation enhancement.")
			.addDropdown(dropdown =>
				dropdown
					.addOption("openai", "OpenAI")
					.addOption("google", "Google AI Studio")
					.addOption("claude", "Claude (Anthropic)")
					.addOption("mistral", "Mistral AI")
					.setValue(this.plugin.settings.preferredProvider)
					.onChange(async (value) => {
						this.plugin.settings.preferredProvider = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h2", { text: " API Keys" });

		new Setting(containerEl)
			.setName("OpenAI API Key")
			.setDesc("Enter your personal OpenAI key (sk-...)")
			.addText(text =>
				text
					.setPlaceholder("sk-...")
					.setValue(this.plugin.settings.openAIKey)
					.onChange(async (value) => {
						this.plugin.settings.openAIKey = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Google AI Studio Key")
			.setDesc("Enter your Google AI Studio key.")
			.addText(text =>
				text
					.setPlaceholder("AIza...")
					.setValue(this.plugin.settings.googleAIKey)
					.onChange(async (value) => {
						this.plugin.settings.googleAIKey = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Claude (Anthropic) Key")
			.setDesc("Enter your Claude (Anthropic) API key.")
			.addText(text =>
				text
					.setPlaceholder("sk-ant-...")
					.setValue(this.plugin.settings.claudeKey)
					.onChange(async (value) => {
						this.plugin.settings.claudeKey = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Mistral AI Key")
			.setDesc("Enter your Mistral AI API key.")
			.addText(text =>
				text
					.setPlaceholder("mistral-...")
					.setValue(this.plugin.settings.mistralKey)
					.onChange(async (value) => {
						this.plugin.settings.mistralKey = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Test AI Connection")
			.setDesc("Verify that the API key for the selected provider is valid.")
			.addButton((btn) => {
				btn.setButtonText("🧪 Test Connection")
					.setCta()
					.onClick(async () => {
						const provider = this.plugin.settings.preferredProvider;
						let key = "";
						let testUrl = "";
						let headers: Record<string, string> = {};
						//let query = "";

						switch (provider) {
							case "openai":
								key = this.plugin.settings.openAIKey;
								testUrl = "https://api.openai.com/v1/models";
								headers = { "Authorization": `Bearer ${key}` };
								break;
							case "google":
								key = this.plugin.settings.googleAIKey;
								testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
								break;
							case "anthropic":
								key = this.plugin.settings.claudeKey;
								testUrl = "https://api.anthropic.com/v1/models";
								headers = { "x-api-key": key };
								break;
							case "mistral":
								key = this.plugin.settings.mistralKey;
								testUrl = "https://api.mistral.ai/v1/models";
								headers = { "Authorization": `Bearer ${key}` };
								break;
							default:
								new Notice("⚠️ No provider selected.");
								return;
						}

						if (!key) {
							new Notice(`⚠️ No API key set for ${provider}.`);
							return;
						}

						new Notice(`Testing ${provider} connection...`);

						try {
							const res = await fetch(testUrl, { headers });
							if (res.ok) {
								new Notice(`✅ ${provider} key is valid!`);
							} else {
								const err = await res.text();
								console.info(`❌ ${provider} failed:`, err);
								new Notice(`❌ Invalid ${provider} API key or rate limit reached.`);
							}
						} catch (e) {
							console.info(e);
							new Notice(`❌ Connection test failed for ${provider}.`);
						}
					});
			});

		containerEl.createEl("h2", { text: "Documentation Style" });
		new Setting(containerEl)
			.setName("Documentation Style")
			.setDesc("Select how the AI should format and tone the documentation.")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("technical", "Technical")
					.addOption("educational", "Educational")
					.addOption("executive", "Executive Summary")
					.setValue(this.plugin.settings.documentationStyle)
					.onChange(async (value: any) => {
						this.plugin.settings.documentationStyle = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName('Enable Watcher')
			.setDesc('Watcher scans the defined folder every 5 seconds and updates docs on file changes.')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableWatcher)
					.onChange(async (value) => {
						this.plugin.settings.enableWatcher = value;
						await this.plugin.saveSettings();

						if (value) {
							this.plugin.watcher.start();
							new Notice(" Watcher enabled");
						} else {
							this.plugin.watcher.stop();
							new Notice(" Watcher disabled");
						}
					})
			);
		new Setting(containerEl)
			.setName('Enable Docker parsing')
			.setDesc('Enable or disable Docker Compose file parsing.')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableDocker)
					.onChange(async (value) => {
						this.plugin.settings.enableDocker = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Enable Terraform parsing')
			.setDesc('Enable or disable Terraform file parsing.')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableTerraform)
					.onChange(async (value) => {
						this.plugin.settings.enableTerraform = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Docker output path')
			.setDesc('Directory for Docker markdown summaries.')
			.addText((text) =>
				text
					.setPlaceholder('Parsed/Docker/')
					.setValue(this.plugin.settings.outputPathDocker)
					.onChange(async (value) => {
						this.plugin.settings.outputPathDocker = value || 'Parsed/Docker/';
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Terraform output path')
			.setDesc('Directory for Terraform markdown summaries.')
			.addText((text) =>
				text
					.setPlaceholder('Parsed/Terraform/')
					.setValue(this.plugin.settings.outputPathTerraform)
					.onChange(async (value) => {
						this.plugin.settings.outputPathTerraform = value || 'Parsed/Terraform/';
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h2", { text: " AI Configuration" });
		new Setting(containerEl)
			.setName("Enable AI Mode")
			.setDesc("If enabled, documentation will be enriched by AI.(It can take time (10s) and consume API credits)")
			.setTooltip("⚠️ Use AI only if you have a valid API key and want enhanced documentation.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableAI)
					.onChange(async (value) => {
						this.plugin.settings.enableAI = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Use AI in Watcher")
			.setDesc("If enabled, the watcher will also use AI to enhance documentation when files change. ⚠️ May cause API spam.")
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.useAIInWatcher)
					.onChange(async (value) => {
						this.plugin.settings.useAIInWatcher = value;
						await this.plugin.saveSettings();
						new Notice(`Watcher AI mode ${value ? "enabled" : "disabled"}`);
					})
			);

		new Setting(containerEl)
			.setName("Preferred AI Provider")
			.setDesc("Choose which AI provider to use for documentation enhancement.")
			.addDropdown(dropdown =>
				dropdown
					.addOption("openai", "OpenAI")
					.addOption("google", "Google AI Studio")
					.addOption("claude", "Claude (Anthropic)")
					.addOption("mistral", "Mistral AI")
					.setValue(this.plugin.settings.preferredProvider)
					.onChange(async (value) => {
						this.plugin.settings.preferredProvider = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h2", { text: " API Keys" });

		new Setting(containerEl)
			.setName("OpenAI API Key")
			.setDesc("Enter your personal OpenAI key (sk-...)")
			.addText(text =>
				text
					.setPlaceholder("sk-...")
					.setValue(this.plugin.settings.openAIKey)
					.onChange(async (value) => {
						this.plugin.settings.openAIKey = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Google AI Studio Key")
			.setDesc("Enter your Google AI Studio key.")
			.addText(text =>
				text
					.setPlaceholder("AIza...")
					.setValue(this.plugin.settings.googleAIKey)
					.onChange(async (value) => {
						this.plugin.settings.googleAIKey = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Claude (Anthropic) Key")
			.setDesc("Enter your Claude (Anthropic) API key.")
			.addText(text =>
				text
					.setPlaceholder("sk-ant-...")
					.setValue(this.plugin.settings.claudeKey)
					.onChange(async (value) => {
						this.plugin.settings.claudeKey = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Mistral AI Key")
			.setDesc("Enter your Mistral AI API key.")
			.addText(text =>
				text
					.setPlaceholder("mistral-...")
					.setValue(this.plugin.settings.mistralKey)
					.onChange(async (value) => {
						this.plugin.settings.mistralKey = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Test AI Connection")
			.setDesc("Verify that the API key for the selected provider is valid.")
			.addButton((btn) => {
				btn.setButtonText("🧪 Test Connection")
					.setCta()
					.onClick(async () => {
						const provider = this.plugin.settings.preferredProvider;
						let key = "";
						let testUrl = "";
						let headers: Record<string, string> = {};
						//let query = "";

						switch (provider) {
							case "openai":
								key = this.plugin.settings.openAIKey;
								testUrl = "https://api.openai.com/v1/models";
								headers = { "Authorization": `Bearer ${key}` };
								break;
							case "google":
								key = this.plugin.settings.googleAIKey;
								testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
								break;
							case "anthropic":
								key = this.plugin.settings.claudeKey;
								testUrl = "https://api.anthropic.com/v1/models";
								headers = { "x-api-key": key };
								break;
							case "mistral":
								key = this.plugin.settings.mistralKey;
								testUrl = "https://api.mistral.ai/v1/models";
								headers = { "Authorization": `Bearer ${key}` };
								break;
							default:
								new Notice("⚠️ No provider selected.");
								return;
						}

						if (!key) {
							new Notice(`⚠️ No API key set for ${provider}.`);
							return;
						}

						new Notice(`Testing ${provider} connection...`);

						try {
							const res = await fetch(testUrl, { headers });
							if (res.ok) {
								new Notice(`✅ ${provider} key is valid!`);
							} else {
								const err = await res.text();
								console.info(`❌ ${provider} failed:`, err);
								new Notice(`❌ Invalid ${provider} API key or rate limit reached.`);
							}
						} catch (e) {
							console.info(e);
							new Notice(`❌ Connection test failed for ${provider}.`);
						}
					});
			});

		containerEl.createEl("h2", { text: "Documentation Style" });
		new Setting(containerEl)
			.setName("Documentation Style")
			.setDesc("Select how the AI should format and tone the documentation.")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("technical", "Technical")
					.addOption("educational", "Educational")
					.addOption("executive", "Executive Summary")
					.setValue(this.plugin.settings.documentationStyle)
					.onChange(async (value: any) => {
						this.plugin.settings.documentationStyle = value;
						await this.plugin.saveSettings();
					})
			);



	}
	async handleImport() {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".yml,.yaml,.tf,.json,.Dockerfile,.env,.sh,.ini";
		input.multiple = true;

		input.onchange = async () => {
			const files = Array.from(input.files || []);
			if (files.length === 0) return;

			const targetFolder = this.plugin.settings.scanPath;
			const folder = this.app.vault.getAbstractFileByPath(targetFolder) instanceof TFolder;

			if (!folder) {
				await this.app.vault.createFolder(targetFolder);
			}

			for (const file of files) {
				const arrayBuffer = await file.arrayBuffer();
				let filename = file.name;
				const base = filename.substring(0, filename.lastIndexOf('.'));
				const ext = filename.substring(filename.lastIndexOf('.'));
				let targetPath = `${targetFolder}/${filename}`;
				let i = 1;

				while (await this.app.vault.adapter.exists(targetPath)) {
					filename = `${base}-${i}${ext}`;
					targetPath = `${targetFolder}/${filename}`;
					i++;
				}

				await this.app.vault.createBinary(targetPath, arrayBuffer);
				const importedFile = this.app.vault.getAbstractFileByPath(targetPath);
				if (importedFile instanceof TFile) {
					await this.plugin.processFile(importedFile);
				}
				new Notice(`✅ Imported file  : ${filename}`);
			}
		};

		input.click();
	}
}
