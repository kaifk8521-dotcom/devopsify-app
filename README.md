# DevOpsify App – minikube + GitHub Actions + ArgoCD

Flow: `git push` → GitHub Actions (test → build image → push to GHCR → update `k8s/deployment.yaml`) → ArgoCD detects the Git change → deploys to minikube.

## 0. Replace the placeholder
```bash
grep -rl kaifk8521-dotcom . | xargs sed -i 's/kaifk8521-dotcom/<your-github-username>/g'
```
(on macOS use `sed -i ''`). Files affected: `k8s/deployment.yaml`, `argocd/application.yaml`.

## 1. Run locally (optional)
```bash
npm install && npm test && npm start     # http://localhost:3000
docker build -t devopsify-app . && docker run -p 3000:3000 devopsify-app
```

## 2. Push to GitHub
```bash
git init && git add . && git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/<you>/devopsify-app.git
git push -u origin main
```
In the repo: **Settings → Actions → General → Workflow permissions → Read and write**.
After the first successful run, go to your profile → **Packages → devopsify-app → Package settings → Change visibility → Public** (so minikube can pull without credentials).

## 3. Start minikube
```bash
minikube start --driver=docker
minikube addons enable ingress
```

## 4. Install ArgoCD
```bash
kubectl create namespace argocd
kubectl apply -n argocd --server-side -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl -n argocd rollout status deploy/argocd-server

# admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo

# UI at https://localhost:8080  (user: admin)
kubectl -n argocd port-forward svc/argocd-server 8080:443
```

## 5. Deploy the app via GitOps
```bash
kubectl apply -f argocd/application.yaml
kubectl -n argocd get applications
kubectl -n devopsify get pods,svc,ingress
```

## 6. Access the app
```bash
echo "127.0.0.1 devopsify.local" | sudo tee -a /etc/hosts
minikube tunnel            # keep running
# open http://devopsify.local
```
(Alternative without ingress: `kubectl -n devopsify port-forward svc/devopsify-app 8081:80`.)

## 7. See CI/CD + GitOps in action
Edit `src/app.js` (e.g. change the heading), commit and push. Watch the Actions run, then the `ci: deploy <sha>` commit appear, then ArgoCD roll out the new pods. Refresh the browser: the version shown is the new commit SHA.

## Layout
```
src/ test/                 Node.js app + tests
Dockerfile                 multi-stage, non-root image
k8s/                       namespace, deployment, service, ingress
argocd/application.yaml    ArgoCD Application (auto-sync, self-heal, prune)
.github/workflows/ci-cd.yaml   test → build/push → bump manifest
```
