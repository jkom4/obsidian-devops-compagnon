import { App, TFile, TFolder } from "obsidian";
import { DockerParser } from "./parser/docker";
import { TerraformParser } from "./parser/terraform";
import { DevOpsSettings } from "./settings";

export class Watcher {
	private app: App;
	private settings: DevOpsSettings;
	private lastModifiedTimes: Record<string, number> = {};
	private intervalId: NodeJS.Timeout | null = null;

	constructor(app: App, settings: DevOpsSettings) {
		this.app = app;
		this.settings = settings;
	}

	start() {
		console.log("Watcher started - Scan every 5s");

		this.intervalId = setInterval(async () => {
			const folderPath = this.settings.scanPath;

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

		const ext = file.extension;
		if ((ext === "yml" || ext === "yaml") && this.settings.enableDocker) {
			await new DockerParser(this.app, this.settings).parseFile(file);
		} else if (ext === "tf" && this.settings.enableTerraform) {
			await new TerraformParser(this.app, this.settings).parseFile(file);
		}
	}
}
