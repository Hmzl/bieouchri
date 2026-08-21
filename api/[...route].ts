import { handleApi } from '../server/router'

export const runtime = 'edge'
export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  return handleApi(req)
}
