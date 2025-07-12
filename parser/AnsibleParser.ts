// parser/AnsibleParser.ts
import { App, TFile } from 'obsidian';
import { load as parseYaml } from 'js-yaml';

export class AnsibleParser {
	app: App;
	settings: any;

	constructor(app: App, settings: any) {
		this.app = app;
		this.settings = settings;
	}

	async parseFile(file: TFile) {
		const content = await this.app.vault.read(file);

		let markdown = `# 🛠️ Ansible Playbook Summary\n\n`;
		markdown += `**File:** \`${file.path}\`\n\n`;
		markdown += `> _Auto-generated summary of an Ansible playbook_\n\n`;

		try {
			const docs = parseYaml(content) as any[];

			if (!Array.isArray(docs)) {
				markdown += `⚠️ No valid Ansible playbook found.\n`;
			} else {
				for (const play of docs) {
					const hosts = play.hosts || 'unspecified';
					markdown += `## 🔹 Play: \`${play.name || 'Unnamed'}\`\n`;
					markdown += `- **Hosts:** \`${hosts}\`\n`;

					if (Array.isArray(play.tasks)) {
						markdown += `- **Tasks:**\n`;
						for (const task of play.tasks) {
							const taskName = task.name || 'Unnamed Task';
							const module = Object.keys(task).find(key => key !== 'name' && key !== 'tags');
							const summary = this.explainModule(module, task[module]);

							markdown += `  - 🔧 \`${taskName}\` (${module})\n`;
							if (summary) {
								markdown += `    > ${summary}\n`;
							}
						}
					} else {
						markdown += `- ⚠️ No tasks found.\n`;
					}
					markdown += '\n';
				}
			}
		} catch (error) {
			console.error('Ansible parsing error:', error);
			markdown += `❌ Error while parsing YAML.\n`;
		}

		const outputPath = `Parsed/Ansible/${file.basename}.md`;
		await this.ensureFolderExists("Parsed/Ansible");

		const existing = this.app.vault.getAbstractFileByPath(outputPath);
		if (existing) {
			await this.app.vault.modify(existing as TFile, markdown);
		} else {
			await this.app.vault.create(outputPath, markdown);
		}

		console.log(`✅ Ansible file parsed and saved to: ${outputPath}`);
	}

	private explainModule(module: string, details: any): string {
		switch (module) {
			case 'copy':
				return `Copies a file from source to destination on the remote machine.`;
			case 'apt':
				return `Manages packages on Debian/Ubuntu systems using APT.`;
			case 'template':
				return `Renders a Jinja2 template file to a destination path on the target host.`;
			case 'service':
				return `Manages system services (e.g., start, stop, restart).`;
			case 'command':
				return `Executes a command on the remote node.`;
			default:
				return '';
		}
	}

	private async ensureFolderExists(folderPath: string) {
		const folder = this.app.vault.getAbstractFileByPath(folderPath);
		if (!folder) {
			await this.app.vault.createFolder(folderPath);
		}
	}
}
