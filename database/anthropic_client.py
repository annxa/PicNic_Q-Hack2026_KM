"""
AnthropicClient — thin wrapper around the Anthropic Python SDK that triggers
the three post-order update calls for the Picnic+ backend:

  1. update_customer_profile  — patch customer attributes after a new order
  2. predict_next_cart        — predict the next basket items
  3. suggest_packages         — propose new meal-kit packages

Usage::

    from database.anthropic_client import AnthropicClient
    from database.prompt_builder import (
        PromptBuilder, CustomerContext, NewOrderEvent, OrderedItem,
        OrderHistory, ProductCatalog, ExistingPackages,
    )

    client  = AnthropicClient()          # reads ANTHROPIC_API_KEY from env
    builder = (
        PromptBuilder()
        .with_customer(ctx)
        .with_new_order(event)
        .with_order_history(history)
        .with_catalog(catalog)
        .with_existing_packages(packages)
    )

    profile_patch  = client.update_customer_profile(builder)   # dict
    next_cart      = client.predict_next_cart(builder)          # list[dict]
    new_packages   = client.suggest_packages(builder)           # list[dict]
"""

from __future__ import annotations

import json
import os
from typing import Any

import anthropic

from database.prompt_builder import BuiltPrompt, PromptBuilder


DEFAULT_MODEL     = "claude-opus-4-6"
DEFAULT_MAX_TOKENS = 1024


class AnthropicClientError(Exception):
    """Raised when the API call fails or the response cannot be parsed."""


class AnthropicClient:
    """
    Synchronous Anthropic Messages API wrapper for post-order predictions.

    Parameters
    ----------
    api_key:
        Anthropic API key. Falls back to the ANTHROPIC_API_KEY environment
        variable when not provided.
    model:
        Claude model ID to use (default: claude-opus-4-6).
    max_tokens:
        Maximum tokens in the model response (default: 1024).
    """

    def __init__(
        self,
        api_key: str | None = None,
        model: str = DEFAULT_MODEL,
        max_tokens: int = DEFAULT_MAX_TOKENS,
    ) -> None:
        resolved_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not resolved_key:
            raise AnthropicClientError(
                "No Anthropic API key found. Set the ANTHROPIC_API_KEY "
                "environment variable or pass api_key= explicitly."
            )
        self._client   = anthropic.Anthropic(api_key=resolved_key)
        self.model     = model
        self.max_tokens = max_tokens

    # -- High-level post-order update calls -----------------------------------

    def update_customer_profile(self, builder: PromptBuilder) -> dict:
        """
        Analyse the new order + history and return a patch dict for the
        Customer row.  Fields set to null mean "keep the current value".

        Returns a dict with keys:
            persona, diet, intolerances, has_children, has_pets,
            confidence, reasoning
        """
        prompt = builder.build_profile_update_prompt()
        result = self._call(prompt)
        if isinstance(result, dict):
            return result
        raise AnthropicClientError(
            f"Expected a JSON object for profile update, got {type(result).__name__}.\n"
            f"Raw response: {result}"
        )

    def predict_next_cart(self, builder: PromptBuilder) -> list[dict]:
        """
        Predict the items the customer is most likely to order next.

        Returns a list of dicts with keys:
            sku, name, quantity, confidence, reason
        """
        prompt = builder.build_cart_prediction_prompt()
        result = self._call(prompt)
        if isinstance(result, list):
            return result
        raise AnthropicClientError(
            f"Expected a JSON array for cart prediction, got {type(result).__name__}.\n"
            f"Raw response: {result}"
        )

    def suggest_packages(self, builder: PromptBuilder) -> list[dict]:
        """
        Propose new meal-kit packages based on the customer's buying pattern.

        Returns a list of dicts with keys:
            name, description, cook_time, portion_quantity,
            article_skus, reason
        """
        prompt = builder.build_package_suggestion_prompt()
        result = self._call(prompt)
        if isinstance(result, list):
            return result
        raise AnthropicClientError(
            f"Expected a JSON array for package suggestions, got {type(result).__name__}.\n"
            f"Raw response: {result}"
        )

    # -- Low-level helpers ----------------------------------------------------

    def call_raw(self, prompt: BuiltPrompt) -> str:
        """Send any BuiltPrompt and return the raw response string."""
        try:
            response = self._client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system=prompt.system,
                messages=prompt.to_messages(),
            )
        except anthropic.APIError as exc:
            raise AnthropicClientError(f"Anthropic API error: {exc}") from exc
        return self._extract_text(response)

    def _call(self, prompt: BuiltPrompt) -> Any:
        """Send a prompt and return parsed JSON (or raw str on parse failure)."""
        raw = self.call_raw(prompt)
        return self._parse_json(raw)

    # -- Static helpers -------------------------------------------------------

    @staticmethod
    def _extract_text(response: anthropic.types.Message) -> str:
        for block in response.content:
            if block.type == "text":
                return block.text
        raise AnthropicClientError("No text block found in Anthropic response.")

    @staticmethod
    def _parse_json(text: str) -> Any:
        """Strip markdown fences (if present) then parse JSON."""
        stripped = text.strip()
        if stripped.startswith("```"):
            lines = stripped.splitlines()
            end   = -1 if lines[-1].strip() == "```" else len(lines)
            stripped = "\n".join(lines[1:end]).strip()
        try:
            return json.loads(stripped)
        except json.JSONDecodeError:
            return text  # return raw string so the caller can decide
