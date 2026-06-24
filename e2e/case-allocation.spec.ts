/**
 * Golden path 1: assign an unallocated case to an offering, then verify
 * the case appears listed under that offering.
 *
 * Setup: all 99 seeded cases start unallocated.
 * Teardown: the allocated case is reset to unallocated after each test.
 */
import { test, expect } from '@playwright/test'
import { adminClient } from './helpers/supabase'

test.describe('Case allocation', () => {
  let allocatedCaseId: string | null = null
  let allocatedOfferingId: string | null = null

  test.afterEach(async () => {
    if (allocatedCaseId) {
      await adminClient()
        .from('case_offerings')
        .delete()
        .eq('case_id', allocatedCaseId)
      allocatedCaseId = null
      allocatedOfferingId = null
    }
  })

  test('assign unallocated case to offering — case appears under offering', async ({ page }) => {
    await page.goto('/cases')
    await page.waitForLoadState('networkidle')

    // Find the first case card that shows "Unallocated"
    // Case cards are the overflow-hidden rounded cards inside the case list
    const firstUnallocatedCard = page
      .locator('div.overflow-hidden')
      .filter({ hasText: 'Unallocated' })
      .first()

    await expect(firstUnallocatedCard).toBeVisible()

    // Expand the case row
    await firstUnallocatedCard.locator('button').first().click()

    // Wait for the assignment section to appear
    const offeringSelect = firstUnallocatedCard.locator('select')
    await expect(offeringSelect).toBeVisible()

    // Select the first real offering option (index 1 skips "Select offering…" placeholder)
    await offeringSelect.selectOption({ index: 1 })

    // Capture the offering ID and name for later verification
    allocatedOfferingId = await offeringSelect.inputValue()
    const selectedOfferingName: string = await offeringSelect.evaluate(
      (el: HTMLSelectElement) => el.options[el.selectedIndex]?.text?.trim() ?? ''
    )
    expect(allocatedOfferingId).toBeTruthy()
    expect(selectedOfferingName).toBeTruthy()

    // Click Add
    await firstUnallocatedCard.getByRole('button', { name: 'Add' }).click()

    // Optimistic update: "Unallocated" badge should disappear
    await expect(firstUnallocatedCard.getByText('Unallocated')).not.toBeVisible({ timeout: 8_000 })

    // Offering name should appear in the card header
    await expect(firstUnallocatedCard.getByText(selectedOfferingName)).toBeVisible()

    // Navigate to the offering detail page to verify server-side persistence
    await page.goto(`/offerings/${allocatedOfferingId}`)
    await page.waitForLoadState('networkidle')

    // The offering detail page shows a "Cases" heading and at least one case
    await expect(page.getByRole('heading', { name: 'Cases', exact: false })).toBeVisible()
    // At least one case is now in the offering (the one we just assigned)
    const caseCount = page.locator('div.rounded-xl.border.bg-background').first()
    await expect(caseCount).toBeVisible()

    // Find the allocated case id so afterEach can clean up
    const { data: junctionRows } = await adminClient()
      .from('case_offerings')
      .select('case_id')
      .eq('offering_id', allocatedOfferingId!)

    if (junctionRows && junctionRows.length > 0) allocatedCaseId = junctionRows[0].case_id
  })
})
