export default {
	async vector(packet) {
		const vector = await this.methods.sign('vector', 'default', packet);
		return vector;
	},
		
	async echo(key, type, packet) {
		let echo_data = false;
		try {
			const {id, agent, client, text, created, md5, sha256, sha512} = packet[type];
			
			this.state('set', `${key}:echo:${type}:time:${id}`);
			const echo_time = Date.now();
			
			this.action('func', `${key}:echo:${type}:${id}`);
			
			this.state('hash', `${key}:echo:${type}:hash:message:${id}`);
			const message_hash = this.lib.hash(text || 'blank', 'sha256');
			
			// hash the agent profile for security
			this.state('hash', `${key}:echo:${type}:packet:sha256:${id}`);
			const packet_hash = this.lib.hash(packet, 'sha256');
			
			this.state('hash', `${key}:echo:${type}:hash:agent:${id}`);
			const agent_hash = this.lib.hash(agent, 'sha256');
			
			this.state('hash', `${key}:echo:${type}:hash:client:${id}`);
			const client_hash = this.lib.hash(client, 'sha256');
			
			this.state('set', `${key}:echo:${type}:keystr:${id}`);
			const keystr = `${key.toUpperCase()}:${type.toUpperCase()}:${id}`;
			
			this.state('set', `${key}:echo:${type}:data:${id}`);
			echo_data = [
				`::::`,
				`::BEGIN:${keystr}`,
				`key: ${key}`, 
				`type: ${type}`, 
				`transport: ${id}`, 
				`created: ${created}`,
				`echo: ${echo_time}`,
				`message: ${message_hash}`,
				`agent: ${agent_hash}`, 
				`client: ${client_hash}`, 
				`packet: ${packet_hash}`, 
				`md5: ${md5}`, 
				`sha256:${sha256}`, 
				`sha512:${sha512}`,
				`::END:${keystr}`,
				'::::',
			].join('\n');
			
			// stub for later features right now just echo into the system process for SIGINT monitoring.
			const echo = this.lib.spawn('echo', [echo_data])
			echo.stdout.on('data', data => {
				this.state('data', `${key}:echo:${type}:stdout:${id}`);
			});
			echo.stderr.on('data', err => {
				this.state('error', `${key}:echo:${type}:stderr:${id}`);
				this.error(err, opts);
			});
			echo.on('close', data => {
				this.state('close', `${key}:echo:${type}:close:${id}`);        
			});
			this.state('return', `${key}:echo:${type}:return:${id}`);
		} 
		finally {
			return echo_data;
		}
	}    
};
