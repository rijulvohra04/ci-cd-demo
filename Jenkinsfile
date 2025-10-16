pipeline {
  agent any

  environment {
    DOCKERHUB_CRED = 'dockerhub-cred'
    DOCKER_IMAGE = "rijul0408/ci-cd-demo"
    IMAGE_TAG = "${env.BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          sh "docker build -t ${DOCKER_IMAGE}:${IMAGE_TAG} ."
        }
      }
    }

    stage('Run Tests') {
      steps {
        script {
          // Remove existing test container if it exists
          sh "docker rm -f ci_test_container || true"

          // Run new test container with dynamic host port allocation
          sh '''
            docker run -d --name ci_test_container -P ${DOCKER_IMAGE}:${IMAGE_TAG}
            sleep 3
            PORT=$(docker port ci_test_container 3000/tcp | cut -d: -f2)
            echo "Mapped port: $PORT"
            HOST=localhost PORT=$PORT node test.js
          '''

          // Remove test container after tests
          sh "docker rm -f ci_test_container || true"
        }
      }
    }

    stage('Push to Docker Hub') {
      when {
        expression { return env.BRANCH_NAME == null || env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master' }
      }
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CRED}", usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
            sh "echo ${DH_PASS} | docker login --username ${DH_USER} --password-stdin"
            sh "docker push ${DOCKER_IMAGE}:${IMAGE_TAG}"
            sh "docker tag ${DOCKER_IMAGE}:${IMAGE_TAG} ${DOCKER_IMAGE}:latest || true"
            sh "docker push ${DOCKER_IMAGE}:latest || true"
          }
        }
      }
    }

    stage('Deploy (run)') {
      steps {
        script {
          // Remove existing deployment container if exists
          sh "docker rm -f ci-cd-demo || true"

          // Run container on host port 9090
          sh "docker run -d --name ci-cd-demo -p 9090:3000 ${DOCKER_IMAGE}:${IMAGE_TAG}"
        }
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
