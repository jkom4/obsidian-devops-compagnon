// ==============================
// Obsidian DevOps Companion Plugin
// ==============================

import {Notice, Plugin} from 'obsidian';
import { DockerParser } from './parser/docker';
import { TerraformParser } from './parser/terraform';
import { Watcher } from './watcher';
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
					if (file.extension === 'yml' || file.extension === 'yaml') {
						await new DockerParser(this.app, this.settings).parseFile(file);
					} else if (file.extension === 'tf') {
						await new TerraformParser(this.app, this.settings).parseFile(file);
					}
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
}
