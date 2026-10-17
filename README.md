# MRB Studio

固定访问入口：[打开 MRB Studio](https://zzh18877220541.github.io/mrb-studio/)。

GitHub Pages 自动转到阿里云上的完整工作台：[直接访问](https://mrb-studio.tail858ede.ts.net/)。首次访问需输入工作台账号和密码。无需 SSH 转发或本地 Tailscale 客户端。

场景编辑、资产标注和示教数据仍由阿里云服务提供。资产、个人场景、人工标注、视频和凭据不上传到这个公共仓库。

后台服务由 systemd 管理，随服务器启动；公网 HTTPS 使用 Tailscale Funnel 出站中继，不需要开放阿里云入站端口。访问速度受中继链路和带宽限制影响。

部署结构与维护说明见 [DEPLOYMENT.md](DEPLOYMENT.md)。

GitHub Pages 设置：Deploy from a branch，`main`，`/ (root)`。
