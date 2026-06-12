/**
 * Golden path 2: delete an offering and verify its previously-linked cases
 * appear as unallocated in the case library.
 *
 * Setup: creates a temporary offering and links a seeded case to it.
 * Teardown: offering is deleted during the test; the case is restored to
 * unallocated after each test (in case the test fails before the UI deletion).
 */
import { test, expect } from '@playwright/test'
import { adminClient, PROP_01_ID } from './helpers/supabase'

test.describe('Offering deletion → case orphaning', () => {
  let testOfferingId: string | null = null
  let linkedCaseId: string | null = null

  test.beforeEach(async () => {
    const supabase = adminClient()

    // Create a temporary test offering in proposition 01
    const { data: offering, error: offeringError } = await supabase
      .from('offerings')
      .insert({
        name: '__e2e-delete-offering',
        sort_order: 9990,
        proposition_id: PROP_01_ID,
      })
      .select('id')
      .single()

    if (offeringError || !offering) throw new Error(`Setup failed: ${offeringError?.message}`)
    testOfferingId = offering.id

    // Link the first seeded case to this offering
    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select('id')
      .limit(1)
      .single()

    if (caseError || !caseRow) throw new Error(`No cases found in seed data`)
    linkedCaseId = caseRow.id

    await supabase
      .from('cases')
      .update({ offering_id: testOfferingId, proposition_id: PROP_01_ID })
      .eq('id', linkedCaseId)
  })

  test.afterEach(async () => {
    const supabase = adminClient()

    // Reset the linked case to unallocated (in case the test failed before deletion)
    if (linkedCaseId) {
      await supabase
        .from('cases')
        .update({ offering_id: null })
        .eq('id', linkedCaseId)
    }

    // Delete the offering if the test didn't do it
    if (testOfferingId) {
      await supabase.from('offerings').delete().eq('id', testOfferingId)
      testOfferingId = null
      linkedCaseId = null
    }
  })

  test('delete offering via dashboard — linked cases appear unallocated in case library', async ({
    page,
  }) => {
    // Navigate to dashboard — proposition 01 is selected by default
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Locate the offering card by its name
    const offeringCard = page
      .locator('div.group')
      .filter({ hasText: '__e2e-delete-offering' })
      .first()

    await expect(offeringCard).toBeVisible()

    // Hover to reveal the action toolbar
    await offeringCard.hover()

    // Click the delete button (title="Delete")
    const deleteButton = offeringCard.locator('[title="Delete"]')
    await expect(deleteButton).toBeVisible({ timeout: 3_000 })
    await deleteButton.click()

    // Confirm deletion in the dialog
    await expect(page.getByRole('heading', { name: 'Delete offering?' })).toBeVisible()
    await page.getByRole('button', { name: 'Delete' }).click()

    // Wait for the offering card to disappear
    await expect(offeringCard).not.toBeVisible({ timeout: 8_000 })

    // Mark the offering as gone so afterEach doesn't try to clean it up again
    testOfferingId = null

    // Navigate to the case library and verify the linked case is now unallocated
    await page.goto('/cases')
    await page.waitForLoadState('networkidle')

    // The formerly-linked case should show the "Unallocated" badge.
    // We verify by checking the case count label includes 99 unallocated
    // (all 99 seeded cases + the test case is back to unallocated).
    // A lighter check: find the specific case row and confirm it shows Unallocated.
    const linkedCase = await adminClient()
      .from('cases')
      .select('client_name')
      .eq('id', linkedCaseId!)
      .single()

    const clientName = linkedCase.data?.client_name ?? ''
    expect(clientName).toBeTruthy()

    // Find the case card by client name and verify Unallocated badge is shown
    const caseCard = page
      .locator('div.overflow-hidden')
      .filter({ hasText: clientName })
      .first()

    await expect(caseCard).toBeVisible()
    await expect(caseCard.getByText('Unallocated')).toBeVisible()

    linkedCaseId = null
  })
})
