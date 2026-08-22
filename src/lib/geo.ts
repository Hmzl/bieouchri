export interface GeoPoint {
  lat: number
  lng: number
  accuracy?: number
}

export async function getCurrentPosition(): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
      reject(new Error('geo.unavailable'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error('geo.denied'))
        } else if (err.code === err.TIMEOUT) {
          reject(new Error('geo.timeout'))
        } else {
          reject(new Error('geo.fail'))
        }
      },
      { enableHighAccuracy: true, timeout: 18000, maximumAge: 0 },
    )
  })
}

export async function reverseGeocode(lat: number, lng: number, lang = 'ar'): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${lang}`
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('geo.noAddress')
  const data = (await res.json()) as { display_name?: string }
  if (!data.display_name) throw new Error('geo.noAddress')
  return data.display_name
}
