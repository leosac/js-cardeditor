pipeline {
    agent any
	stages {
	    stage('Build') {
            steps {
                nodejs(nodeJSInstallationName: 'node20') {
                    sh 'npm ci'
					sh 'npm run build --if-present'
                }
            }
        }
        stage('Sonar') {
            environment {
                scannerHome = tool 'SonarQube Scanner default'
            }
            steps {
                withSonarQubeEnv('SonarQube Community') {
                    sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=leosac_js-cardeditor_3d3658e1-95f2-4047-96f6-70103bd0c507"
                }
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate(abortPipeline: true)
                }
            }
            when {
                anyOf {
                    branch 'main'
                    buildingTag()
                    changeRequest()
                }
            }
        }
    }
}