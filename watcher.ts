import {App, Notice, TFile, TFolder} from "obsidian";
import DevOpsCompanionPlugin from "./main";

export class Watcher {
	private app: App;
	private lastModifiedTimes: Record<string, number> = {};
	private intervalId: NodeJS.Timeout | null = null;
	private plugin: DevOpsCompanionPlugin;

	constructor(app: App, plugin: DevOpsCompanionPlugin) {
		this.app = app;
		this.plugin = plugin;
	}

	start() {
		console.log("Watcher started - Scan every 5s");

		this.intervalId = setInterval(async () => {
			const folderPath = this.plugin.settings.scanPath;

			if (!folderPath) {
				console.warn("No scan folder defined in settings.");
				return;
			}

			const folder = this.app.vault.getAbstractFileByPath(folderPath);
			if (folder && folder instanceof TFolder) {
				for (const file of folder.children) {
					if (file instanceof TFile) {
						const ext = file.extension;
						if (["yml", "yaml", "tf"].includes(ext)) {
							const lastModified = file.stat.mtime;
							if (this.lastModifiedTimes[file.path] !== lastModified) {
								this.lastModifiedTimes[file.path] = lastModified;
								await this.handleFileChange(file);
							}
						}
					}
				}
			} else {
				console.warn(` The folder '${folderPath}' does not exist or is not a TFolder.`);
			}
		}, 5000);
	}

	stop() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
			console.log(" Watcher stopped.");
		}
	}

	private async handleFileChange(file: TFile) {
		console.log(` Modified file : ${file.path}`);

		try {
			if (this.plugin.settings.useAIInWatcher && this.plugin.settings.enableAI ) {
				await this.plugin.processFile(file);
				new Notice(`🤖 AI updated: ${file.name}`);
			} else {
				await this.plugin.processFileLite(file);
				new Notice(`🔁 Updated local doc for: ${file.name}`);
			}
		} catch (err) {
			console.error(`❌ Error parsing ${file.path}`, err);
		}
	}
}
