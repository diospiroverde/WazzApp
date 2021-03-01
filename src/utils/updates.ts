import http from 'https';
import semver from 'semver';
import packa from '../../package.json';
import { getEnvironment } from './environment';

const envConfig = getEnvironment();

export function checkUpdates(): Promise<boolean> {
    return new Promise(done => {
        http.get('https://github.com/diospiroverde/WazzApp/update.json', (res) => {
            res.setEncoding('utf8');
            res.on('data', (d) => {
				d = JSON.parse(d);
				if(envConfig.runEnv == "PROD"){
					if (semver.lt(packa.version, d.version)) {
						done(true);
					} else {
						done(false);
					}
				}else{
					if (semver.lt(packa.betaVersion, d.betaVersion || packa.betaVersion)) {
						done(true);
					} else {
						done(false);
					}
				}
            });
        }).on('error', (e) => {
            done(false);
        });
    })
}