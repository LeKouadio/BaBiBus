const routeCache = new Map<string, [number, number][]>();

export const getRoute = async (points: [number, number][], profile: 'walking' | 'driving' = 'driving'): Promise<[number, number][] | undefined> => {
  if (!points || points.length < 2) return undefined;
  
  // Basic validation to ensure points are valid coordinates
  const validPoints = points.filter(p => 
    p && p.length === 2 && 
    typeof p[0] === 'number' && typeof p[1] === 'number' &&
    !isNaN(p[0]) && !isNaN(p[1]) &&
    (p[0] !== 0 || p[1] !== 0)
  );

  if (validPoints.length < 2) return points;

  // Create a cache key based on points and profile
  const cacheKey = `${profile}:${validPoints.map(p => `${p[0].toFixed(5)},${p[1].toFixed(5)}`).join(';')}`;
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  try {
    // OSRM expects [lng, lat] separated by semicolons
    const waypoints = validPoints.map(p => `${p[1]},${p[0]}`).join(';');
    
    // Using OSRM for road-following path
    // We use a public OSRM instance. If this is slow, consider a private mirror.
    const url = `https://router.project-osrm.org/route/v1/${profile}/${waypoints}?overview=full&geometries=geojson&continue_straight=true`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        // Some servers require a user agent or similar
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      // OSRM returns [lng, lat], Leaflet expects [lat, lng]
      const roadPath = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
      
      // Cache the result
      routeCache.set(cacheKey, roadPath);
      
      return roadPath;
    } else {
      console.warn('OSRM returned non-OK code:', data.code, data.message);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('OSRM request timed out');
    } else {
      console.error('Error fetching route from OSRM:', error);
    }
  }
  
  return points; // Fallback to straight line if routing fails
};

