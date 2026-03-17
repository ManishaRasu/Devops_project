pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test Pipeline') {
            steps {
                echo 'Pipeline is working!'
            }
        }

        stage('Run Docker (Optional)') {
            steps {
                echo 'Run docker manually in terminal'
            }
        }

    }

    post {
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}