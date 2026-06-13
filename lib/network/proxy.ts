import { ProxyAgent, setGlobalDispatcher } from "undici";

let configuredProxyUrl: string | undefined;

export function configureServerProxy() {
  const proxyUrl = getProxyUrl();

  if (!proxyUrl || configuredProxyUrl === proxyUrl) {
    return;
  }

  setGlobalDispatcher(new ProxyAgent(proxyUrl));
  configuredProxyUrl = proxyUrl;
}

export function getProxyUrl() {
  return (
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    process.env.ALL_PROXY ||
    process.env.https_proxy ||
    process.env.http_proxy ||
    process.env.all_proxy
  );
}
