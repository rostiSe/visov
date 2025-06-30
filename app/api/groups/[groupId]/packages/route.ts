// app/api/groups/[groupId]/packages/route.ts
// This file handles subscribing and unsubscribing from packages for a group.
// It is built on the NEW, simplified database schema and logic.
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client'; // Make sure this path is correct


/**
 * @method GET
 * @description Fetches the packages a group has subscribed to, and all other available packages.
 * This allows the UI to display "Your Packages" and "Discover New Packages".
 */
export async function GET(request: NextRequest, context: any) {
  const { groupId } = await context.params;

  if (!groupId) {
    return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
  }

  try {
    // 1. Fetch the group and its currently subscribed packages
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        subscribedPackages: true, // Uses the many-to-many relation
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const subscribedPackageIds = group.subscribedPackages.map((p) => p.id);

    // 2. Fetch all other packages that the group has NOT subscribed to yet
    const availablePackages = await prisma.package.findMany({
      where: {
        isActive: true,
        id: {
          notIn: subscribedPackageIds, // Filter out already subscribed packages
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      subscribedPackages: group.subscribedPackages,
      availablePackages,
    });
  } catch (error: any) {
    console.error('Error fetching package data for group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * @method POST
 * @description Subscribes a group to a new package.
 * @body { packageId: string }
 *
 * This is now a very simple operation. We just connect the group and the package.
 * The daily cron job will automatically pick up this new subscription and start
 * serving questions from it. No complex scheduling logic is needed here anymore!
 */
export async function POST(request: NextRequest, context: any) {
  const { groupId } = await context.params;

  try {
    const { packageId } = await request.json();

    if (!packageId) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
    }

    // Use a simple `update` to `connect` the package to the group.
    // This is the power of the many-to-many relationship in the new schema.
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        subscribedPackages: {
          connect: { id: packageId }, // The magic happens here!
        },
      },
      include: {
        subscribedPackages: true, // Return the new list of subscribed packages
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Package subscribed successfully.',
      subscribedPackages: updatedGroup.subscribedPackages,
    });
  } catch (error: any) {
    console.error('Error subscribing to package:', error);
    // Handle specific prisma error for record not found
    if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Group or Package not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to subscribe to package' }, { status: 500 });
  }
}


/**
 * @method DELETE
 * @description Unsubscribes a group from a package.
 * @body { packageId: string } - The package to unsubscribe from.
 *
 * This is the counterpart to POST. It simply disconnects the package from the group.
 * The cron job will automatically stop serving questions from this package for the group.
 */
export async function DELETE(request: NextRequest, context: any) {
  const { groupId } = await context.params;

  try {
    const { packageId } = await request.json();

    if (!packageId) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
    }

    // Use `update` to `disconnect` the package from the group.
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        subscribedPackages: {
          disconnect: { id: packageId }, // The magic happens here!
        },
      },
       include: {
        subscribedPackages: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Package unsubscribed successfully.',
      subscribedPackages: updatedGroup.subscribedPackages,
    });
  } catch (error: any) {
    console.error('Error unsubscribing from package:', error);
    if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Group or Package not found, or package was not subscribed.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to unsubscribe from package' }, { status: 500 });
  }
}
