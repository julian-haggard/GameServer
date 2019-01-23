const {Schema, StreamingAbstractor} = require('protocore')

module.exports = () => {
	const build = new StreamingAbstractor()
	
	build.register('render', new Schema([
		{
			"name": 'entities',
			"type": 'list',
			"of": new Schema([
				{
					'name': 'type',
					'type': 'uint',
					'size': 8
				},
				{
					'name': 'color',
					'type': 'string'
				},
				{
					'name': 'x',
					'type': 'int',
					'size': 32
				},
				{
					'name': 'y',
					'type': 'int',
					'size': 32
				},
				{
					'name': 'width',
					'type': 'int',
					'size': 32
				},
				{
					'name': 'height',
					'type': 'int',
					'size': 32
				},
				{
					'name': 'xvel',
					'type': 'int',
					'size': 16
				},
				{
					'name': 'yvel',
					'type': 'int',
					'size': 16
				},
				{
					'name': 'name',
					'type': 'string'
				}
			])
		}
	]))
	
	build.register('profile', new Schema([
		{
			'name': 'name',
			'type': 'string'
		}
	]))

	build.register('chat', new Schema([
		{
			'name': 'message',
			'type': 'string'
		},
		{
			'name': 'from',
			'type': 'string'
		}
	]))
	
	build.register('keyup', new Schema([
		{
			'name': 'key',
			'type': 'string'
		}
	]))
	
	build.register('keydown', new Schema([
		{
			'name': 'key',
			'type': 'string'
		}
	]))
	
	build.register('dead', new Schema([]))
	
	build.register('respawn', new Schema([]))

	return build
}