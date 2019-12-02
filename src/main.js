/****************************************************************************
 * Script initializations to execute after the page loads
 ***************************************************************************/
$(function () {
	console.log('RPH Tools', VERSION_STRING, 'start')
	var modules = [
		chatModule,
		pmModule,
		rngModule,
		moddingModule,
		settingsModule,
		aboutModule,
	]

	rphToolsModule.init(modules)
	console.log('RPH Tools initialization complete')
});