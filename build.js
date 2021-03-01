const { execSync } = require('child_process');
const builder = require('electron-builder');
const rm = require('del');
const fs = require('fs');
const path = require('path');
const package = require('./package.json');
const { BuildPublic } = require('./buildpublic');


const outDir = path.resolve(__dirname, "electron-build/");

async function CleanBuildDir(){
    if (fs.existsSync(outDir)) {
        await rm(outDir, { force: true });
    }
}
async function cleanAndBuildTSC() {
    await CleanBuildDir();
    fs.mkdirSync(outDir);
    execSync(`cp -r src/ ${outDir}/src/`);
    await rm(`${outDir}/**/*.ts`,{force:true});
	execSync("npm run tsc");
	if(process.env.BUILD == "BETA"){
		console.log("beta");
		let tempdata = fs.readFileSync(`${outDir}/src/utils/environment.js`,"utf8");
		tempdata = tempdata.replace('const environment = "PROD";','const environment = "BETA";');
		fs.writeFileSync(`${outDir}/src/utils/environment.js`,tempdata,"utf8")
	}
}

async function init() {
    await cleanAndBuildTSC();
    try{
        await builder.build({
			
            config: {
				...package.build,
            }
        })
        await BuildPublic();
    }catch(ex){
        console.error(ex);
    }
    await CleanBuildDir();
    
}

init();