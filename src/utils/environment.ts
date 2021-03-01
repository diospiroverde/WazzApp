
const environment = "PROD";
interface EnvironmentConfig{
	name: string
	runEnv: "PROD" | "BETA"
}
export function getEnvironment(): EnvironmentConfig{
	if(environment == "PROD"){
		return {
			name:"WazzApp",
			runEnv:"PROD",
		}
	}else{
		return {
			name:"WazzApp BETA",
			runEnv:"BETA",
		}
	}
}