# MRB Studio 固定访问入口

固定地址为 https://zzh18877220541.github.io/mrb-studio/ 。GitHub Pages 托管入口，入口读取同目录的 `backend.json`，确认 HTTPS 可达后进入完整工作台。工作台、保存、标注、网格和视频保持同源，文件和数据留在阿里云。

## 网络

本次服务器安全组不能修改，公网 80 连接经 ACME 外部验证超时，因此改用 Tailscale Funnel 出站中继。用户浏览器不需要安装 Tailscale，不需要 SSH 转发；服务器后台保持连接，Funnel 使用固定的 `*.ts.net` HTTPS 名称并负责证书。

```text
浏览器 → GitHub Pages 固定入口 → Funnel 公网 HTTPS
                                  ↓ 加密中继
                    服务器 mrb-tailscaled
                                  ↓ 127.0.0.1:9080
                    Nginx 登录保护
                                  ↓ 127.0.0.1:8765
                    工作台 / 标注代理 / 视频
```

Funnel 只映射带登录保护的 9080，不能直接映射未鉴权的 8765 或 8770。`/_mrb/health` 是唯一公开就绪响应，只返回 `{"status":"ok"}`，无资产和用户信息。Funnel 官方说明有不可配置的带宽限制，多相机大视频需以真实链路测量为准。

本机采用隔离的 `mrb-tailscaled.service`，使用 `--tun=userspace-networking`、独立 socket/state；不修改系统 DNS，不接受其他节点路由，不改变现有 SSH 网络。安装的是官方 Tailscale 1.104.1 Linux amd64 静态包，下载时验证官方 SHA256。守护进程和应用均由 systemd 管理。

该中继路径的多相机 Range 回放在 HTTP/2 下出现首帧等待和定位超时，HTTP/1.1 对照测试可正常定位，因此仅在 `mrb-tailscaled.service` 设置 `GODEBUG=http2server=0`，由 HTTPS 服务协商 HTTP/1.1。TLS、固定地址和登录保护保留，客户端无需配置；不修改系统其他服务的 HTTP 协议。[Go 官方设置说明](https://go.dev/doc/godebug)。Nginx 压缩页面脚本、样式与 JSON，视频保留可定位的字节范围响应。

## 首次启用

1. 用户在登录 URL 中完成账号和设备连接；服务器 `status` 应为 `Running`。
2. 启用持久 Funnel；如果 CLI 返回启用 Funnel 的网页，需要账号所有者批准。
3. 在账号 Machines 页为该服务器关闭设备密钥过期，避免长期开机服务数月后要求重新登录。
4. 验证公网 TLS、匿名 401、登录后场景、标注和视频 Range 后，发布真实 `backend.json`。未验证的地址不得标为上线。

```bash
sudo /usr/local/bin/mrb-tailscale --socket=/run/mrb-tailscale/tailscaled.sock status
sudo /usr/local/bin/mrb-tailscale --socket=/run/mrb-tailscale/tailscaled.sock funnel --bg --yes http://127.0.0.1:9080
sudo /usr/local/bin/mrb-tailscale --socket=/run/mrb-tailscale/tailscaled.sock funnel status
systemctl status mrb-review mrb-annotate nginx mrb-tailscaled
```

`--bg` 的 Funnel 配置在守护进程重启及机器重启后恢复。关闭设备密钥过期是账号侧设置；不能用客户端自动生成无限凭据来替代账号授权。

## 登录

`setup_access.py` 创建随机密码和 Nginx 密码哈希。凭据只保存在用户私有目录 `~/.config/mrb-studio/access.json`、`access.txt`（0600）；哈希在 `/etc/mrb-studio/htpasswd`（root:www-data，0640）。重复运行不重置密码。密码不进入 GitHub、页面 URL、命令行或日志。`backend.json` 只能包含公开的 HTTPS 地址。

## 验证

- `studio/tests/browser_deployment.py`：匿名和错误凭据拒绝，登录后场景、标注 iframe、JSON POST 校验、视频和精确 Range；不修改个人场景或资产标注。
- `studio/tests/browser_pages_entry.py`：未配置状态、拒绝 HTTP、断网重试、真实登录网关和标注页面交接，保留 hash 路由。跨源测试使用模拟公网域名转发到仅本机 TLS 测试服务，避免 Chrome 的 loopback 权限机制与真实公网情况混淆。
- `studio/tests/browser_pages_entry.py --live`：从实际 GitHub Pages 入口进入公网工作台，严格验证 TLS 和登录后的场景编辑页面。
- `studio/tests/test_video_cache.py`：视频索引前置、逐帧校验无画质变化、缓存复用及源文件变化后失效。回放服务在 `data/cache/studio-video/` 按需生成无损重封装副本，不修改 episode 视频；可以删除缓存以回收空间。优先使用 `MRB_FFMPEG` 或系统 ffmpeg，其次使用当前运行环境的 `imageio_ffmpeg`；工具不可用时仍提供原视频。
- 推理回放另外提供默认“流畅”压缩副本，保留时间轴，可切回原始画质；`studio/tools/warm_inference_videos.py` 提前生成已注册录像的缓存。最多两个编码任务、每个两个 CPU 线程，不使用训练 GPU。`browser_inference_performance.py` 测量五路起播和定位，`browser_inference_sync.py` 验证缓冲联动、画质切换和暂停。

本机测试监听为 `127.0.0.1:9443`，使用临时自签名测试证书。允许忽略证书错误的测试参数只适用于这个 loopback 监听，不得用于公网验收。公网必须验证受信任证书。

GitHub 仓库只发布入口 HTML、端点配置、说明和 `.nojekyll`。资产、场景、标注、视频、服务器密钥和密码均不上传。

参考：[Funnel 固定 DNS 与使用示例](https://tailscale.com/docs/reference/examples/funnel)、[后台运行与重启恢复](https://tailscale.com/docs/reference/tailscale-cli/funnel)、[限制](https://tailscale.com/docs/features/tailscale-funnel)。
