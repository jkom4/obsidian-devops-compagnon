// ==============================
// TerraformParser.ts - Terraform file parser with contextual documentation
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
			markdown += `**File:** \`${file.path}\`\n\n`;

			const blockRegex = /(resource|provider|variable|output|module)\s+"([\w-]+)"(?:\s+"([\w-]+)")?\s*{([\s\S]*?)}/g;
			let match;
			let found = false;

			while ((match = blockRegex.exec(content)) !== null) {
				found = true;
				const [_, type, name, subname, body] = match;

				const blockTitle = `## ${type.charAt(0).toUpperCase() + type.slice(1)}: \`${name}${subname ? ` - ${subname}` : ''}\``;
				const codeBlock = '```hcl\n' + body.trim() + '\n```\n';

				// Add a contextual description
				let context = '';
				switch (type) {
					case 'provider':
						context = '> **Provider** defines which cloud or service platform Terraform interacts with (e.g. AWS, Azure, etc.).\n';
						break;
					case 'resource':
						context = '> **Resource** describes an infrastructure object, such as an instance, database, or load balancer.\n';
						break;
					case 'variable':
						context = '> **Variable** allows you to parameterize Terraform modules to make configurations reusable and dynamic.\n';
						break;
					case 'output':
						context = '> **Output** exposes information after Terraform apply, useful for debugging or referencing in other modules.\n';
						break;
					case 'module':
						context = '> **Module** is a container for multiple resources that can be reused across projects.\n';
						break;
				}

				markdown += `${blockTitle}\n${context}\n${codeBlock}\n`;
			}

			if (!found) {
				markdown += `⚠️ No recognized block (resource, provider, etc.) found.\n`;
			}

			const outputPath = `Parsed/Terraform/${file.basename}.md`;
			await this.ensureFolderExists("Parsed/Terraform");
			const existing = this.app.vault.getAbstractFileByPath(outputPath);
			if (existing instanceof TFile) {
				await this.app.vault.modify(existing, markdown);
			} else {
				await this.app.vault.create(outputPath, markdown);
			}
			console.log(`✅ Terraform file parsed and saved to: ${outputPath}`);
		} catch (error) {
			console.error('❌ Terraform parsing error:', error);
		}
	}

	private async ensureFolderExists(folderPath: string) {
		const folder = this.app.vault.getAbstractFileByPath(folderPath);
		if (!folder) {
			await this.app.vault.createFolder(folderPath);
		}
	}
}
