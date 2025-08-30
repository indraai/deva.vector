export default {
	/**************
	method: Guard
	params: packet
	describe: The global service feature that installs with every agent
	***************/
	vector(packet) {
		this.context('feature');
		return new Promise((resolve, reject) => {
			const guard = this.guard();
			const agent = this.agent();
			const global = [];
			guard.global.forEach((item,index) => {
				global.push(`::begin:global:${item.key}:${item.id}`);
				for (let x in item) {
					global.push(`${x}: ${item[x]}`);
				}
				global.push(`::end:global:${item.key}:${this.lib.hash(item)}`);
			});
			const concerns = [];
			guard.concerns.forEach((item, index) => {
				concerns.push(`${index + 1}. ${item}`);
			})
			
			const info = [
				`::BEGIN:VECTOR:${packet.id}`,
				'### Client',
				`::begin:client:${guard.client_id}`,
				`id: ${guard.client_id}`,
				`client: ${guard.client_name}`,
				'**concerns**',
				concerns.join('\n'),
				`::end:client:${this.lib.hash(guard)}`,
				'### Global',
				global.join('\n'),
				`date: ${this.lib.formatDate(Date.now(), 'long', true)}`,
				`::END:VECTOR:${this.lib.hash(packet)}`,
			].join('\n');
			this.question(`${this.askChr}feecting parse ${info}`).then(feecting => {
				return resolve({
					text: feecting.a.text,
					html: feecting.a.html,
					data: guard.concerns,
				});
			}).catch(err => {
				return this.error(err, packet, reject);
			})
		});
	},
	
};
