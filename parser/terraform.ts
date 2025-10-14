
import { App, TFile } from "obsidian";

export class TerraformParser {
	app: App;
	settings: any;

	constructor(app: App, settings: any) {
		this.app = app;
		this.settings = settings;
	}

	async parseFile(file: TFile): Promise<string> {
		const content = await this.app.vault.read(file);
		let markdown = `# 🌍 Terraform Summary\n\n**File:** \`${file.path}\`\n\n`;

		const blockRegex =
			/(resource|provider|variable|output|module)\s+"([\w-]+)"(?:\s+"([\w-]+)")?\s*{([\s\S]*?)}/g;
		let match;
		let found = false;

		while ((match = blockRegex.exec(content)) !== null) {
			found = true;
			const [_, type, name, subname, body] = match;
			markdown += `## ${type.charAt(0).toUpperCase() + type.slice(1)}: \`${name}${
				subname ? ` - ${subname}` : ""
			}\`\n`;
			markdown += "```hcl\n" + body.trim() + "\n```\n\n";
		}

		if (!found) {
			markdown += "⚠️ No recognized blocks found.\n";
		}

		return markdown;
	}
}
