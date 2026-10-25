# MRB Studio

固定访问入口：[打开 MRB Studio](https://zzh18877220541.github.io/mrb-studio/)。

GitHub Pages 自动转到阿里云上的完整工作台：[直接访问](https://mrb-studio.tail858ede.ts.net/)。首次访问需输入工作台账号和密码。无需 SSH 转发或本地 Tailscale 客户端。

场景编辑、资产标注和示教数据仍由阿里云服务提供。资产、个人场景、人工标注、未授权公开视频和凭据不上传到这个公共仓库。

后台服务由 systemd 管理，随服务器启动；公网 HTTPS 使用 Tailscale Funnel 出站中继，不需要开放阿里云入站端口。访问速度受中继链路和带宽限制影响。

部署结构与维护说明见 [DEPLOYMENT.md](DEPLOYMENT.md)。

GitHub Pages 设置：Deploy from a branch，`main`，`/ (root)`。

## 公开演示录像

用户明确要求公开查看的最初五任务演示录像，现单独托管于 [原画质全部视角](replays/20261025/)。该只读静态区不依赖 Funnel 或临时隧道，保留原始分辨率、帧率与视频码流，只前置播放索引。未上传训练集、私人场景、轨迹、标注或凭据。完整工作台仍使用原入口。
