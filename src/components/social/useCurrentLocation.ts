"use client";

import { useState } from "react";

type UseCurrentLocationOptions = {
  addNotification: (message: string) => void;
  requireAuth: (action: string) => boolean;
  setLocation: (location: string) => void;
};

export function useCurrentLocation({
  addNotification,
  requireAuth,
  setLocation,
}: UseCurrentLocationOptions) {
  const [isLocating, setIsLocating] = useState(false);

  function handleUseCurrentLocation() {
    if (!requireAuth("tag your location")) {
      return;
    }

    if (isLocating) {
      return;
    }

    if (!navigator.geolocation) {
      addNotification("Geolocation is not available in this browser.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`;
        setLocation(nextLocation);
        addNotification("Location tag updated.");
        setIsLocating(false);
      },
      () => {
        addNotification("Location permission was not granted.");
        setIsLocating(false);
      },
    );
  }

  return {
    isLocating,
    useCurrentLocation: handleUseCurrentLocation,
  };
}
