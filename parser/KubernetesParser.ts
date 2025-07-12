// parser/KubernetesParser.ts
import { App, TFile } from 'obsidian';
import { load as parseYaml } from 'js-yaml';

export class KubernetesParser {
	app: App;
	settings: any;

	constructor(app: App, settings: any) {
		this.app = app;
		this.settings = settings;
	}

	async parseFile(file: TFile) {
		const content = await this.app.vault.read(file);
		const documents = content.split(/^---$/gm).map(d => d.trim()).filter(Boolean);

		let markdown = `# ☸️ Kubernetes File Summary\n\n`;
		markdown += `**File:** \`${file.path}\`\n\n`;
		markdown += `> _Auto-generated summary of Kubernetes manifests_\n\n`;

		for (const doc of documents) {
			try {
				const obj = parseYaml(doc) as any;
				if (!obj || typeof obj !== 'object') continue;

				const kind = obj.kind || 'Unknown';
				const name = obj.metadata?.name || 'Unnamed';
				const namespace = obj.metadata?.namespace || 'default';

				markdown += `## 🧩 ${kind}: \`${name}\`\n`;
				markdown += `- **Namespace:** \`${namespace}\`\n`;
				if (kind === 'Deployment') {
					const replicas = obj.spec?.replicas ?? 1;
					const containers = obj.spec?.template?.spec?.containers?.map((c: any) => `\`${c.name}\` (image: \`${c.image}\`)`) || [];
					markdown += `- **Replicas:** \`${replicas}\`\n`;
					markdown += `- **Containers:** ${containers.join(', ')}\n`;
				} else if (kind === 'Service') {
					const type = obj.spec?.type || 'ClusterIP';
					const ports = obj.spec?.ports?.map((p: any) => `\`${p.port}:${p.targetPort}\``).join(', ') || 'N/A';
					markdown += `- **Type:** \`${type}\`\n`;
					markdown += `- **Ports:** ${ports}\n`;
				} else if (kind === 'Ingress') {
					const rules = obj.spec?.rules?.map((r: any) => r.host).join(', ') || 'N/A';
					markdown += `- **Hosts:** ${rules}\n`;
				}

				markdown += '\n```yaml\n' + doc + '\n```\n\n';
			} catch (error) {
				console.error('Error parsing YAML block:', error);
				markdown += `⚠️ Error parsing a section of the YAML.\n\n`;
			}
		}

		const outputPath = `Parsed/Kubernetes/${file.basename}.md`;
		await this.ensureFolderExists("Parsed/Kubernetes");

		const existing = this.app.vault.getAbstractFileByPath(outputPath);
		if (existing) {
			await this.app.vault.modify(existing as TFile, markdown);
		} else {
			await this.app.vault.create(outputPath, markdown);
		}

		console.log(`✅ Kubernetes file parsed and saved to: ${outputPath}`);
	}

	private async ensureFolderExists(folderPath: string) {
		const folder = this.app.vault.getAbstractFileByPath(folderPath);
		if (!folder) {
			await this.app.vault.createFolder(folderPath);
		}
	}
}
