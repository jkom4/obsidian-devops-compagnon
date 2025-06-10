// ==============================
// TerraformParser.ts - Parsing des fichiers Terraform
// ==============================
import { App, TFile } from 'obsidian';

export class TerraformParser {
	app: App;
	settings: any;

	constructor(app: App, settings: any) {
		this.app = app;
		this.settings = settings;
	}

	async parseFile(file: TFile) {
		const content = await this.app.vault.read(file);

		try {
			let markdown = `# 🌍 Terraform Summary\n\n`;
			markdown += `**File :** \`${file.path}\`\n\n`;

			const blockRegex = /(resource|provider|variable|output|module)\s+"([\w-]+)"(?:\s+"([\w-]+)")?\s*{([\s\S]*?)}/g;
			let match;
			let found = false;

			while ((match = blockRegex.exec(content)) !== null) {
				found = true;
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const [_, type, name, subname, body] = match;

				markdown += `## ${type.charAt(0).toUpperCase() + type.slice(1)}: \`${name}${subname ? ` - ${subname}` : ''}\`\n`;
				markdown += '```hcl\n' + body.trim() + '\n```\n\n';
			}

			if (!found) {
				markdown += `⚠️ No recognized block (resource, provider, etc.) found.\n`;
			}

			const outputPath = `Parsed/Terraform/${file.basename}.md`;
			await this.ensureFolderExists("Parsed/Terraform");
			await this.app.vault.create(outputPath, markdown);
			console.log(` Terraform file parsed and saved to: ${outputPath}`);
		} catch (error) {
			console.error('Terraform parsing error :', error);
		}
	}

	private async ensureFolderExists(folderPath: string) {
		const folder = this.app.vault.getAbstractFileByPath(folderPath);
		if (!folder) {
			await this.app.vault.createFolder(folderPath);
		}
	}
}
