import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomePage } from "@/components/HomePage";
import { Providers } from "@/app/providers";

function renderWithProviders(ui: React.ReactNode) {
  return render(<Providers>{ui}</Providers>);
}

describe("Home page", () => {
  it("renders the headline and primary CTA", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/Capturing light/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Capture & License/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Browse the gallery/i })).toBeInTheDocument();
  });
});
