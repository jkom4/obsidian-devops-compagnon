// ==============================
// DevOpsSettings.ts - Plugin parameters
// ==============================
import {normalizePath, Notice, PluginSettingTab, Setting, TFolder} from "obsidian";
import DevOpsCompanionPlugin from "./main";

export interface DevOpsSettings {
	scanPath: string;
	enableDocker: boolean;
	enableTerraform: boolean;
	outputPathDocker: string;
	outputPathTerraform: string;
}

export const DEFAULT_SETTINGS: DevOpsSettings = {
	scanPath: 'DevOpsImports',
	enableDocker: true,
	enableTerraform: true,
	outputPathDocker: 'Parsed/Docker/',
	outputPathTerraform: 'Parsed/Terraform/',
};

// ==============================
// DevOpsSettingsTab.ts - configuration pannel
// ==============================
export class DevOpsSettingsTab extends PluginSettingTab {
	plugin: DevOpsCompanionPlugin;

	constructor(app: any, plugin: DevOpsCompanionPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'DevOps Companion Settings' });

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
			.setDesc("Import one or more .yml / .yaml / .tf files into the vault.")
			.addButton(btn =>
				btn
					.setButtonText("Import...")
					.onClick(() => this.handleImport())
			);

		new Setting(containerEl)
			.setName('Enable Docker Parsing')
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
			.setName('Enable Terraform Parsing')
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
			.setName('Docker Output Path')
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
			.setName('Terraform Output Path')
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
	}
	async handleImport() {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".yml,.yaml,.tf";
		input.multiple = true;

		input.onchange = async () => {
			const files = Array.from(input.files || []);
			if (files.length === 0) return;

			const targetFolder = normalizePath("DevOpsImports");
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
				new Notice(`✅ Imported file  : ${filename}`);
			}
		};

		input.click();
	}
}
