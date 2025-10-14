
import { App, TFile } from "obsidian";
import { load as parseYaml } from "js-yaml";

export class DockerParser {
	app: App;
	settings: any;

	constructor(app: App, settings: any) {
		this.app = app;
		this.settings = settings;
	}

	async parseFile(file: TFile): Promise<string> {
		const content = await this.app.vault.read(file);
		let markdown = `# 🐳 Docker Compose Summary\n\n**File:** \`${file.path}\`\n\n`;

		try {
			const data = parseYaml(content) as any;
			if (!data.services) {
				markdown += "⚠️ No services found in this Docker Compose file.\n";
				return markdown;
			}

			for (const [serviceName, serviceDef] of Object.entries(data.services)) {
				const service = serviceDef as any;
				markdown += `## Service: \`${serviceName}\`\n`;
				markdown += `- **Image**: \`${service.image || "Not specified"}\`\n`;

				if (service.ports) {
					markdown += `- **Ports**: \`${service.ports.join(", ")}\`\n`;
				}
				if (service.volumes) {
					markdown += `- **Volumes**: \`${service.volumes.join(", ")}\`\n`;
				}
				if (service.environment) {
					markdown += `- **Environment Variables**:\n`;
					for (const [key, val] of Object.entries(service.environment)) {
						markdown += `  - \`${key}\`: ${val}\n`;
					}
				}

				markdown += "\n";
			}
		} catch (error) {
			markdown += `❌ Error parsing Docker Compose: ${error}\n`;
		}

		return markdown;
	}
}
